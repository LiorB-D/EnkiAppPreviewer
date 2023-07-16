import fetch from 'node-fetch';
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js';
import {ReactNode} from 'react'

import parse, {
    DOMNode,
    Element,
    HTMLReactParserOptions
  } from "html-react-parser";

  const md: MarkdownIt = new MarkdownIt({
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return '<pre class="hljs"><code>' +
                 hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                 '</code></pre>';
        } catch (__) {}
      }
  
      return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
  });

export async function generateWorkout(branch: String, workoutDir: String): Promise<Insight[]> {
    
    const url = `https://api.github.com/repos/enkidevs/curriculum/contents/${workoutDir}/README.md?ref=${branch}`;
    const options = {
        headers: { 
            'Accept': 'application/vnd.github.v3.raw',
            'Authorization': `bearer ${process.env.REACT_APP_GITHUB_KEY}`, 
            'X-GitHub-Api-Version': '2022-11-28'
        }
    };
    const insights: Insight[] = []

    try {
        
        const response = await fetch(url, options)

        const text = await response.text() + 'exercises:'
        
        const startIndex = text.indexOf('insights:')
        const endIndex = text.indexOf('exercises:', startIndex)

        const workoutsRaw = text.substring(startIndex, endIndex).split("\n")
        for(let i = 1; i < workoutsRaw.length - 1; i++) {
            const startIndex = workoutsRaw[i].indexOf('-')
            const insightName = workoutsRaw[i].substring(startIndex + 1).trim()
            
            const insightHtml = await generateInsightHTML(branch, workoutDir, insightName)

            insights.push(insightHtml)
        }
        
    } catch (error) {
        console.log("Error")
    }

    return insights
}

export async function generateInsightHTML(branch: String, workoutDir: String, insight: String): Promise<Insight> {
    // Construct the URL
    
    const url = `https://api.github.com/repos/enkidevs/curriculum/contents/${workoutDir}/${insight}.md?ref=${branch}`;
    
    const options = {
        headers: { 
            'Accept': 'application/vnd.github.v3.raw',
            'Authorization': `Bearer ${process.env.REACT_APP_GITHUB_KEY}`, // Replace 'YOUR-TOKEN' with your actual token
            'X-GitHub-Api-Version': '2022-11-28'
        }
    };
    
    

    try {
        // Fetch the markdown content
        const response = await fetch(url, options);
        const text = await response.text() + "\n---";
       
        let insightTitle = "Error parsing Title"
        let titleMatch = text.match(/# (.*?)\n/)
        if(titleMatch) {
            insightTitle = titleMatch[1]
        };
        
        // Find the index of '## Content' and the next '---'
        const startIndex = text.indexOf('## Content');
        const endIndex = text.indexOf('\n---', startIndex);

        
        
        // Extract and return the content, if found
        if (startIndex !== -1 && endIndex !== -1) {
            const content = text.substring(startIndex, endIndex);
            const htmlResultStr = md.render(content)
            
            const parseResult = parse(htmlResultStr)
            
            if(typeof parseResult == "string") {
                return {title: parseResult, body: []}
            } else if(Array.isArray(parseResult)) {
                return {title: insightTitle, body: parseResult.slice(1)}
            } else {
                return {title: insightTitle, body: [parseResult]}
            }

        }
        return {title: "Error could not find header", body: []}
  
    } catch (error) {
        console.error(`Error fetching or parsing content from ${url}: ${error}`);
        return {title: "Error fetch failed", body: []};
    }
}