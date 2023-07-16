'use client'
 
import { useState, useEffect } from 'react'

export default function InsightView({insights} : {insights: Insight[]}) {
  const [insightInd, setInsightInd] = useState(0)



  
  const nextInsight = () => {
      setInsightInd(insightInd + 1)
  }
  const prevInsight = () => {
    setInsightInd(insightInd - 1)
  }

  return (
    <div>
      {insightInd > 0 && <button onClick={() => prevInsight()}>Back</button>}
      <div className = "phoneFrame">
      <div className = "workoutBody">
        <h2>{insights[insightInd].title}</h2>
        {insights[insightInd].body.map((elem) => {
          if(elem.type === "pre") {
            return <>
                <div className = "codeTopBar"></div>
                {elem}
            </>
          } else {return elem}
        })}
      </div>
      </div>
      {insightInd < insights.length - 1 && <button onClick={() => nextInsight()}>Next</button>}
      
    </div>
  )
}