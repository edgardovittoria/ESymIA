import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Port, Project, Simulation } from "../../../../model/esymiaModels";
import { useSelector } from "react-redux";
import { selectedProjectSelector } from "../../../../store/projectSlice";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ChartsListProps {
  scaleMode: string;
  graphToVisualize: "All Graph" | "Z" | "S" | "Y";
  selectedLabel: { label: string, id: number }[]
}

interface Dataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
}


export const ChartsList: React.FC<ChartsListProps> = ({
  scaleMode,
  graphToVisualize,
  selectedLabel
}) => {
  const selectedProject = useSelector(selectedProjectSelector)
  const ports = selectedProject?.ports.filter(p => p.category === 'port') as Port[]
  const matrix_Z = JSON.parse((selectedProject?.simulation as Simulation).results.matrix_Z);
  const matrix_Y = JSON.parse((selectedProject?.simulation as Simulation).results.matrix_Y);
  const matrix_S = JSON.parse((selectedProject?.simulation as Simulation).results.matrix_S);
  const [chartsOrderedIDs, setChartsOrderedIDs] = useState([
    "R",
    "L",
    "Z_Module",
    "Z_Phase",
    "G",
    "C",
    "Y_Module",
    "Y_Phase",
    "S_Module",
    "S_Phase",
    "S_dB",
  ])
  const [chartsDataOptionsList, setChartsDataOptionsList] = useState(chartsOrderedIDs.map((id) =>
    chartsDataOptionsFactory(selectedProject?.simulation as Simulation, selectedProject, id, matrix_Z, matrix_Y, matrix_S, ports, selectedLabel)
  ))
  const [chartsDataToVisualize, setChartsDataToVisualize] = useState(chartsDataOptionsList)
  useEffect(() => {
    if (graphToVisualize === "All Graph") {
      setChartsOrderedIDs(["R", "L", "Z_Module", "Z_Phase", "G", "C", "Y_Module", "Y_Phase", "S_Module", "S_Phase", "S_dB",])
    }
    if (graphToVisualize === "Z") {
      setChartsOrderedIDs(["R", "L", "Z_Module", "Z_Phase"])
    }
    if (graphToVisualize === "Y") {
      setChartsOrderedIDs(["G", "C", "Y_Module", "Y_Phase"])
    }
    if (graphToVisualize === "S") {
      setChartsOrderedIDs(["S_Module", "S_Phase", "S_dB"])
    }
  }, [graphToVisualize, selectedProject])

  useEffect(() => {
    setChartsDataToVisualize(
      chartsOrderedIDs.map((id) =>
        chartsDataOptionsFactory(selectedProject?.simulation as Simulation, selectedProject, id, matrix_Z, matrix_Y, matrix_S, ports, selectedLabel)
      )
    )
  }, [chartsOrderedIDs, selectedProject, selectedLabel])


  const optionsWithScaleMode = (options: any, scaleMode: string) => {
    let updatedOptions;
    switch (scaleMode) {
      case "logarithmic":
        updatedOptions = {
          ...options,
          scales: {
            x: {
              type: "logarithmic",
              display: true,
            },
          },
        };
        break;
      case "linear":
        updatedOptions = {
          ...options,
          scales: {}
        }
        break;
      default:
        break;
    }
    return updatedOptions;
  };



  return (
    <>
      {chartsDataToVisualize.map((chartData, index) => {
        return (
          <div className="box w-[100%]" key={index}>
            <Line
              options={optionsWithScaleMode(chartData.options, scaleMode)}
              data={chartData.data}
            />
          </div>
        )
      })}
    </>
  );
};

const chartsDataOptionsFactory = (
  simulation: Simulation,
  project: Project | undefined,
  label: string,
  matrix_Z: any[][][][],
  matrix_Y: any[][][][],
  matrix_S: any[][][][],
  ports: Port[],
  selectedLabel: { label: string, id: number }[]
) => {
  const colorArray = [
    "red",
    "blue",
    "violet",
    "green",
    "orange",
    "yellow",
    "pink",
  ];
  let result: { data: { datasets: Dataset[]; labels: number[] }; options: {} } =
  {
    data: { datasets: [], labels: [] },
    options: {},
  };

  const computeGraphResults = (unit: string, ports:Port[], matrix: any[][][][], getGraphFormulaResult: (index: number, v:any[], innerLabels:number[]) => number) => {
    const labels = pairs(ports.map(p => p.name))
    let innerLabels = (project && project.signal) ? project.signal.signalValues.map(sv => sv.freq) : [];
    let matrices: number[][] = [];
    for (let i = 0; i < ports.length * ports.length; i++) {
      matrices.push([])
      matrix[i].forEach(m => {
        m.forEach((v, index) => {
          (matrices[i] as Array<number>).push(getGraphFormulaResult(index,v, innerLabels))
        })
      })
    }
    const datasets = matrices.reduce((dats, m, index) => {
      if (selectedLabel.filter(l => l.label === "All Ports").length > 0) {
        dats.push({
          label: `${labels[index][0]} - ${labels[index][1]}`,
          data: m,
          borderColor: colorArray[index],
          backgroundColor: "white",
        });
      } else {
        selectedLabel.forEach((l) => {
          if (index === l.id) {
            dats.push({
              label: l.label,
              data: m,
              borderColor: colorArray[index],
              backgroundColor: "white",
            });
          }
        })
      }
      return dats
    },[] as Dataset[]);

    let options = {
      responsive: true,
      plugins: {
        legend: {
          position: "top" as const
        },
        title: {
          display: true,
          text: `${simulation.name} - ${unit}`,
        },
      },
      layout: {
        padding: {
          right: 20,
        },
      },
    };
    result.data = {
      labels: innerLabels,
      datasets: datasets,
    };
    result.options = options;
    return result
  }
  switch (label) {
    case "R":
      result = computeGraphResults('R(mOhm)', ports, matrix_Z, (index,v,innerLabels) => v[0] * 1e3)
      break;
    case "L":
      result = computeGraphResults('L(nH)', ports, matrix_Z, (index,v, innerLabels) => (v[1] / (2 * Math.PI * innerLabels[index])) * 1e9)
      break;
    case "Z_Module":
      result = computeGraphResults('Z Module', ports, matrix_Z, (index,v, innerLabels) => Math.sqrt(v[0] * v[0] + v[1] * v[1]))
      break;
    case "Z_Phase":
      result = computeGraphResults('Z Phase', ports, matrix_Z, (index,v,innerLabels) => Math.atan2(v[1], v[0]))
      break;
    case "G":
      result = computeGraphResults('G(S)', ports, matrix_Y, (index,v,innerLabels) => v[0])
      break;
    case "C":
      result = computeGraphResults('C(F)', ports, matrix_Y, (index,v,innerLabels) => v[1] / (2 * Math.PI * innerLabels[index]))
      break;
    case "Y_Module":
      result = computeGraphResults('Y Module', ports, matrix_Y, (index,v,innerLabels) => Math.sqrt(v[0] * v[0] + v[1] * v[1]))
      break;
    case "Y_Phase":
      result = computeGraphResults('Y Phase', ports, matrix_Y, (index,v,innerLabels) => Math.atan2(v[1], v[0]))
      break;
    case "S_Module":
      result = computeGraphResults('S Module', ports, matrix_S, (index,v,innerLabels) => Math.sqrt(v[0] * v[0] + v[1] * v[1]))
      break;
    case "S_Phase":
      result = computeGraphResults('S Phase', ports, matrix_S, (index,v,innerLabels) => Math.atan2(v[1], v[0]))
      break;
    case "S_dB":
      result = computeGraphResults('S dB', ports, matrix_S, (index,v,innerLabels) => 20 * Math.log10(Math.sqrt(v[0] * v[0] + v[1] * v[1])))
      break;
    default:
      break;
  }
  return result;
};

export const pairs = (a: string[]) => {
  return a.flatMap((x: string) => {
    return a.flatMap((y: string) => {
      return [[x, y]]
    });
  });
}
