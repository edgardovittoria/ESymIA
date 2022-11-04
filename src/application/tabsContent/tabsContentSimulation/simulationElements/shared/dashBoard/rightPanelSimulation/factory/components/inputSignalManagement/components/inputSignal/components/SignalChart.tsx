import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from "chart.js";
import {Signal} from "../../../../../../../../../../../../../model/Port";
import React from "react";
import {Line} from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    PointElement,
    LinearScale,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface SignalChartProps {
    signal: Signal,
    type: 'module' | 'phase'
}

interface Dataset {
    label: string,
    data: number[],
    borderColor: string,
    backgroundColor: string,
    lineTension: number
}


export const SignalChart: React.FC<SignalChartProps> = ({signal, type}) => {


    const datasets: Dataset[] = [];
    let frequencyValues: number[] = [];
    let signalMagnitude: number[] = [];
    let signalPhase: number[] = [];
    signal.signalValues.forEach(value => {
        frequencyValues.push(value.freq)
        let magnitudeValue = Math.sqrt((Math.pow(value.signal.Re,2) + Math.pow(value.signal.Im,2)))
        signalMagnitude.push(magnitudeValue)
        let phaseValue = Math.atan(value.signal.Im/value.signal.Re)
        signalPhase.push(phaseValue)
    })
    if(type === "module"){
        datasets.push({
            label: 'Module',
            data: signalMagnitude,
            borderColor: 'blue',
            backgroundColor: 'blue',
            lineTension: .5
        })
    }else{
        datasets.push({
            label: 'Phase',
            data: signalPhase,
            borderColor: 'red',
            backgroundColor: 'red',
            lineTension: .5
        })
    }


    const labels = frequencyValues

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: signal.name,
            },
        },
        layout: {
            padding: {
                right: 20,
            },
        }
    };

    const data = {
        labels,
        datasets: datasets
    }

    return (
        <div className="box w-100">
            <Line options={options} data={data}/>
        </div>
    )

}