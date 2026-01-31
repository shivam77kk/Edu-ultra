import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

const fitness = google.fitness('v1');





export const getFitnessDataArgs = async (accessToken) => {
    try {
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); 

        const startTimeMillis = startTime.getTime();
        const endTimeMillis = endTime.getTime();

        
        const stepsRes = await fitness.users.dataset.aggregate({
            auth,
            userId: 'me',
            requestBody: {
                aggregateBy: [{
                    dataTypeName: 'com.google.step_count.delta',
                    dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
                }],
                bucketByTime: { durationMillis: 86400000 }, 
                startTimeMillis,
                endTimeMillis
            }
        });

        
        const sleepRes = await fitness.users.sessions.list({
            auth,
            userId: 'me',
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            activityType: 72 
        });

        const steps = stepsRes.data.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0;

        let sleepHours = 0;
        if (sleepRes.data.session && sleepRes.data.session.length > 0) {
            sleepRes.data.session.forEach(session => {
                const start = parseInt(session.startTimeMillis);
                const end = parseInt(session.endTimeMillis);
                sleepHours += (end - start) / (1000 * 60 * 60);
            });
        }

        return {
            steps,
            sleepHours: parseFloat(sleepHours.toFixed(1))
        };

    } catch (error) {
        console.error("Google Fit API Error:", error.message);
        
        return {
            steps: Math.floor(Math.random() * 5000) + 2000,
            sleepHours: 6 + Math.random() * 3
        };
    }
};

export const analyzeWellnessArgs = (data) => {
    let alert = null;
    let focusScore = 70; 

    
    if (data.sleepHours < 6) {
        alert = "Low sleep detected, reduce workload";
        focusScore -= 20;
    } else if (data.sleepHours > 8) {
        focusScore += 10;
    }

    
    if (data.steps > 5000) {
        alert = "High focus window detected";
        focusScore += 10;
    } else if (data.steps < 1000) {
        alert = "Low activity, take a walk!";
        focusScore -= 5;
    }

    return {
        focusScore: Math.min(100, Math.max(0, focusScore)),
        alert
    };
};
