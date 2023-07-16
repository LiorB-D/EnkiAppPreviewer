import {generateInsightHTML, generateWorkout} from './workoutParser'
import {ReactNode} from 'react';
import InsightView from './insightView'


export default async function Page({ params }: { params: { branch: string, skill: string, workoutSect: string, workout: string } }) { 
    const {branch, skill, workoutSect, workout} = params
    const workoutDir = skill + "/" + workoutSect + "/" + workout
   
 
    const insights = await generateWorkout(branch, workoutDir);;


    return (
        <div>
            {insights.length > 0 && <>
                <InsightView insights = {insights}/>
            </>
            }
  
        </div>
    )
}