import React, {useEffect, useState} from "react";
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
  selectedLabel: { label:string, id:number }[]
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
    if(graphToVisualize === "All Graph"){
      setChartsOrderedIDs(["R", "L", "Z_Module", "Z_Phase", "G", "C", "Y_Module", "Y_Phase", "S_Module", "S_Phase", "S_dB",])
    }
    if(graphToVisualize === "Z"){
      setChartsOrderedIDs(["R", "L", "Z_Module", "Z_Phase"])
    }
    if(graphToVisualize === "Y"){
      setChartsOrderedIDs(["G", "C", "Y_Module", "Y_Phase"])
    }
    if(graphToVisualize === "S"){
      setChartsOrderedIDs(["S_Module", "S_Phase", "S_dB"])
    }
  }, [graphToVisualize, selectedProject])

  useEffect(() => {
    setChartsDataToVisualize(
        chartsOrderedIDs.map((id) =>
            chartsDataOptionsFactory(selectedProject?.simulation as Simulation, selectedProject, id, matrix_Z, matrix_Y, matrix_S, ports, selectedLabel)
        )
    )
  }, [chartsOrderedIDs, selectedProject])

  useEffect(() => {
    setChartsDataToVisualize(chartsOrderedIDs.map((id) =>
        chartsDataOptionsFactory(selectedProject?.simulation as Simulation, selectedProject, id, matrix_Z, matrix_Y, matrix_S, ports, selectedLabel)
    ))
  }, [selectedLabel, selectedProject])


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
        return(
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
  selectedLabel: { label:string, id:number }[]
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
  let portNumber: number = ports.length
  const labels = pairs(ports.map(p => p.name))
  switch (label) {
    case "R":
      // let matrix_Z_ModuleR: any = eval(simulation.results.matrix_Z);
      let labelsR: number[] = [];
      project?.signal?.signalValues.forEach((sv) => labelsR.push(sv.freq));
      const datasetsR: Dataset[] = [];
      let matrices_Z_RER: number[][] = [];
      for(let i = 0; i<portNumber*portNumber; i++){
        matrices_Z_RER.push([])
        matrix_Z[i].forEach(m => {
          m.forEach(v => {
            (matrices_Z_RER[i] as Array<number>).push(v[0]*1000)
          })
        })
      }
      matrices_Z_RER.forEach((matrix, index) => {
        if(selectedLabel.filter(l => l.label === "All Ports").length > 0){
          datasetsR.push({
            label:  `${labels[index][0]} - ${labels[index][1]}`,
            data: matrix,
            borderColor: colorArray[index],
            backgroundColor: "white",
          });
        }else{
          selectedLabel.forEach((l) => {
            if(index === l.id){
              datasetsR.push({
                label:  l.label,
                data: matrix,
                borderColor: colorArray[index],
                backgroundColor: "white",
              });
            }
          })
        }
      });

      let optionsR = {
        responsive: true,
        plugins: {
          legend: {
            position: "top" as const
          },
          title: {
            display: true,
            text: simulation ? `${simulation.name} - R(mOhm)` : "",
          },
        },
        layout: {
          padding: {
            right: 20,
          },
        },
      };

      const dataR = {
        labels: labelsR,
        datasets: datasetsR,
      };
      result.data = dataR;
      result.options = optionsR;
      break;
    case "L":
      // let matrix_ZH: any = eval(simulation.results.matrix_Z);
      let labelsH: number[] = [];
      project?.signal?.signalValues.forEach((sv) => labelsH.push(sv.freq));
      const datasetsH: Dataset[] = [];
      let matrices_Z_IM: number[][] = [];
      for(let i = 0; i<portNumber*portNumber; i++){
        matrices_Z_IM.push([])
        matrix_Z[i].forEach(m => {
          m.forEach((v,index) => {
            (matrices_Z_IM[i] as Array<number>).push(
                (v[1] / (2 * Math.PI * labelsH[index])) * 1000000000
            )
          })
        })
      }
      matrices_Z_IM.forEach((matrix, index) => {
        if(selectedLabel.filter(l => l.label === "All Ports").length > 0){
          datasetsH.push({
            label:  `${labels[index][0]} - ${labels[index][1]}`,
            data: matrix,
            borderColor: colorArray[index],
            backgroundColor: "white",
          });
        }else{
          selectedLabel.forEach((l) => {
            if(index === l.id){
              datasetsH.push({
                label:  l.label,
                data: matrix,
                borderColor: colorArray[index],
                backgroundColor: "white",
              });
            }
          })
        }
      });
      const optionsH = {
        responsive: true,
        plugins: {
          legend: {
            position: "top" as const,
          },
          title: {
            display: true,
            text: simulation ? `${simulation.name} - L(nH)` : "",
          },
        },
        layout: {
          padding: {
            right: 20,
          },
        },
      };

      const dataH = {
        labels: labelsH,
        datasets: datasetsH,
      };
      result.data = dataH;
      result.options = optionsH;
      break;
    case "Z_Module":
      // let matrix_Z_Module: any = eval(simulation.results.matrix_Z);
      let labelsZModule: number[] = [];
      project?.signal?.signalValues.forEach((sv) =>
        labelsZModule.push(sv.freq)
      );
      const datasetsZModule: Dataset[] = [];
      let matrices_Z_Module_RE: number[][] = [];
      for(let i = 0; i<portNumber*portNumber; i++){
        matrices_Z_Module_RE.push([])
        matrix_Z[i].forEach(m => {
          m.forEach((v) => {
            (matrices_Z_Module_RE[i] as Array<number>).push(
                Math.sqrt(v[0] * v[0] + v[1] * v[1])
            )
          })
        })
      }
      matrices_Z_Module_RE.forEach((matrix, index) => {
        if(selectedLabel.filter(l => l.label === "All Ports").length > 0){
          datasetsZModule.push({
            label:  `${labels[index][0]} - ${labels[index][1]}`,
            data: matrix,
            borderColor: colorArray[index],
            backgroundColor: "white",
          });
        }else{
          selectedLabel.forEach((l) => {
            if(index === l.id){
              datasetsZModule.push({
                label:  l.label,
                data: matrix,
                borderColor: colorArray[index],
                backgroundColor: "white",
              });
            }
          })
        }
      });

      const optionsZModule = {
        responsive: true,
        plugins: {
          legend: {
            position: "top" as const,
          },
          title: {
            display: true,
            text: simulation ? `${simulation.name} - Z Module` : "",
          },
        },
        layout: {
          padding: {
            right: 20,
          },
        },
      };

      const dataZModule = {
        labels: labelsZModule,
        datasets: datasetsZModule,
      };
      result.data = dataZModule;
      result.options = optionsZModule;
      break;
    case "Z_Phase":
      // let matrix_Z_Phase: any = eval(simulation.results.matrix_Z);
      let labelsZPhase: number[] = [];
      project?.signal?.signalValues.forEach((sv) => labelsZPhase.push(sv.freq));
      const datasetsZPhase: Dataset[] = [];
      let matrices_Z_Phase_RE: number[][] = [];
      for(let i = 0; i<portNumber*portNumber; i++){
        matrices_Z_Phase_RE.push([])
        matrix_Z[i].forEach(m => {
          m.forEach((v) => {
            (matrices_Z_Phase_RE[i] as Array<number>).push(
                Math.atan2(v[1], v[0])
            )
          })
        })
      }
      matrices_Z_Phase_RE.forEach((matrix, index) => {
        if(selectedLabel.filter(l => l.label === "All Ports").length > 0){
          datasetsZPhase.push({
            label:  `${labels[index][0]} - ${labels[index][1]}`,
            data: matrix,
            borderColor: colorArray[index],
            backgroundColor: "white",
          });
        }else{
          selectedLabel.forEach((l) => {
            if(index === l.id){
              datasetsZPhase.push({
                label:  l.label,
                data: matrix,
                borderColor: colorArray[index],
                backgroundColor: "white",
              });
            }
          })
        }
      });

      const optionsZPhase = {
        responsive: true,
        plugins: {
          legend: {
            position: "top" as const,
          },
          title: {
            display: true,
            text: simulation ? `${simulation.name} - Z Phase` : "",
          },
        },
        layout: {
          padding: {
            right: 20,
          },
        },
      };

      const dataZPhase = {
        labels: labelsZPhase,
        datasets: datasetsZPhase,
      };
      result.data = dataZPhase;
      result.options = optionsZPhase;
      break;
    case "G":
      // let matrix_YG: any = eval(simulation.results.matrix_Y);
      let labelsG: number[] = [];
      project?.signal?.signalValues.forEach((sv) => labelsG.push(sv.freq));
      const datasetsG: Dataset[] = [];
      let matrices_YG_RE: number[][] = [];
      for(let i = 0; i<portNumber*portNumber; i++){
        matrices_YG_RE.push([])
        matrix_Y[i].forEach(m => {
          m.forEach((v) => {
            (matrices_YG_RE[i] as Array<number>).push(
                v[0]
            )
          })
        })
      }
      matrices_YG_RE.forEach((matrix, index) => {
        if(selectedLabel.filter(l => l.label === "All Ports").length > 0){
          datasetsG.push({
            label:  `${labels[index][0]} - ${labels[index][1]}`,
            data: matrix,
            borderColor: colorArray[index],
            backgroundColor: "white",
          });
        }else{
          selectedLabel.forEach((l) => {
            if(index === l.id){
              datasetsG.push({
                label:  l.label,
                data: matrix,
                borderColor: colorArray[index],
                backgroundColor: "white",
              });
            }
          })
        }
      });

      const optionsG = {
        responsive: true,
        plugins: {
          legend: {
            position: "top" as const,
          },
          title: {
            display: true,
            text: simulation ? `${simulation.name} - G(S)` : "",
          },
        },
        layout: {
          padding: {
            right: 20,
          },
        },
      };

      const dataG = {
        labels: labelsG,
        datasets: datasetsG,
      };
      result.data = dataG;
      result.options = optionsG;
      break;
    case "C":
      // let matrix_YC: any = eval(simulation.results.matrix_Y);
      let labelsC: number[] = [];
      project?.signal?.signalValues.forEach((sv) => labelsC.push(sv.freq));
      const datasetsC: Dataset[] = [];
      let matrices_YC_RE: number[][] = [];
      for(let i = 0; i<portNumber*portNumber; i++){
        matrices_YC_RE.push([])
        matrix_Y[i].forEach(m => {
          m.forEach((v, index) => {
            (matrices_YC_RE[i] as Array<number>).push(
                v[1] / (2 * Math.PI * labelsC[index])
            )
          })
        })
      }
      matrices_YC_RE.forEach((matrix, index) => {
        if(selectedLabel.filter(l => l.label === "All Ports").length > 0){
          datasetsC.push({
            label:  `${labels[index][0]} - ${labels[index][1]}`,
            data: matrix,
            borderColor: colorArray[index],
            backgroundColor: "white",
          });
        }else{
          selectedLabel.forEach((l) => {
            if(index === l.id){
              datasetsC.push({
                label:  l.label,
                data: matrix,
                borderColor: colorArray[index],
                backgroundColor: "white",
              });
            }
          })
        }
      });

      const optionsC = {
        responsive: true,
        plugins: {
          legend: {
            position: "top" as const,
          },
          title: {
            display: true,
            text: simulation ? `${simulation.name} - C(F)` : "",
          },
        },
        layout: {
          padding: {
            right: 20,
          },
        },
      };

      const dataC = {
        labels: labelsC,
        datasets: datasetsC,
      };
      result.data = dataC;
      result.options = optionsC;
      break;
    case "Y_Module":
      // let matrix_Y_Module: any = eval(simulation.results.matrix_Y);
      let labelsYModule: number[] = [];
      project?.signal?.signalValues.forEach((sv) =>
        labelsYModule.push(sv.freq)
      );
      const datasetsYModule: Dataset[] = [];
      let matrices_Y_Module_RE: number[][] = [];
      for(let i = 0; i<portNumber*portNumber; i++){
        matrices_Y_Module_RE.push([])
        matrix_Y[i].forEach(m => {
          m.forEach((v) => {
            (matrices_Y_Module_RE[i] as Array<number>).push(
                Math.sqrt(v[0] * v[0] + v[1] * v[1])
            )
          })
        })
      }
      matrices_Y_Module_RE.forEach((matrix, index) => {
        if(selectedLabel.filter(l => l.label === "All Ports").length > 0){
          datasetsYModule.push({
            label:  `${labels[index][0]} - ${labels[index][1]}`,
            data: matrix,
            borderColor: colorArray[index],
            backgroundColor: "white",
          });
        }else{
          selectedLabel.forEach((l) => {
            if(index === l.id){
              datasetsYModule.push({
                label:  l.label,
                data: matrix,
                borderColor: colorArray[index],
                backgroundColor: "white",
              });
            }
          })
        }
      });

      const optionsYModule = {
        responsive: true,
        plugins: {
          legend: {
            position: "top" as const,
          },
          title: {
            display: true,
            text: simulation ? `${simulation.name} - Y Module` : "",
          },
        },
        layout: {
          padding: {
            right: 20,
          },
        },
      };

      const dataYModule = {
        labels: labelsYModule,
        datasets: datasetsYModule,
      };
      result.data = dataYModule;
      result.options = optionsYModule;
      break;
    case "Y_Phase":
      // let matrix_Y_Phase: any = eval(simulation.results.matrix_Y);
      let labelsYPhase: number[] = [];
      project?.signal?.signalValues.forEach((sv) => labelsYPhase.push(sv.freq));
      const datasetsYPhase: Dataset[] = [];
      let matrices_Y_Phase_RE: number[][] = [];
      for(let i = 0; i<portNumber*portNumber; i++){
        matrices_Y_Phase_RE.push([])
        matrix_Y[i].forEach(m => {
          m.forEach((v) => {
            (matrices_Y_Phase_RE[i] as Array<number>).push(
                Math.atan2(v[1], v[0])
            )
          })
        })
      }
      matrices_Y_Phase_RE.forEach((matrix, index) => {
        if(selectedLabel.filter(l => l.label === "All Ports").length > 0){
          datasetsYPhase.push({
            label:  `${labels[index][0]} - ${labels[index][1]}`,
            data: matrix,
            borderColor: colorArray[index],
            backgroundColor: "white",
          });
        }else{
          selectedLabel.forEach((l) => {
            if(index === l.id){
              datasetsYPhase.push({
                label:  l.label,
                data: matrix,
                borderColor: colorArray[index],
                backgroundColor: "white",
              });
            }
          })
        }
      });

      const optionsYPhase = {
        responsive: true,
        plugins: {
          legend: {
            position: "top" as const,
          },
          title: {
            display: true,
            text: simulation ? `${simulation.name} - Y Phase` : "",
          },
        },
        layout: {
          padding: {
            right: 20,
          },
        },
      };

      const dataYPhase = {
        labels: labelsYPhase,
        datasets: datasetsYPhase,
      };
      result.data = dataYPhase;
      result.options = optionsYPhase;
      break;
    case "S_Module":
      // let matrix_S_Module: any = eval(simulation.results.matrix_S);
      let labelsSModule: number[] = [];
      project?.signal?.signalValues.forEach((sv) =>
        labelsSModule.push(sv.freq)
      );
      const datasetsSModule: Dataset[] = [];
      let matrices_S_Module_RE: number[][] = [];
      for(let i = 0; i<portNumber*portNumber; i++){
        matrices_S_Module_RE.push([])
        matrix_S[i].forEach(m => {
          m.forEach((v) => {
            (matrices_S_Module_RE[i] as Array<number>).push(
                Math.sqrt(v[0] * v[0] + v[1] * v[1])
            )
          })
        })
      }
      matrices_S_Module_RE.forEach((matrix, index) => {
        if(selectedLabel.filter(l => l.label === "All Ports").length > 0){
          datasetsSModule.push({
            label:  `${labels[index][0]} - ${labels[index][1]}`,
            data: matrix,
            borderColor: colorArray[index],
            backgroundColor: "white",
          });
        }else{
          selectedLabel.forEach((l) => {
            if(index === l.id){
              datasetsSModule.push({
                label:  l.label,
                data: matrix,
                borderColor: colorArray[index],
                backgroundColor: "white",
              });
            }
          })
        }
      });

      const optionsSModule = {
        responsive: true,
        plugins: {
          legend: {
            position: "top" as const,
          },
          title: {
            display: true,
            text: simulation ? `${simulation.name} - S Module` : "",
          },
        },
        layout: {
          padding: {
            right: 20,
          },
        },
      };

      const dataSModule = {
        labels: labelsSModule,
        datasets: datasetsSModule,
      };
      result.data = dataSModule;
      result.options = optionsSModule;
      break;
    case "S_Phase":
      // let matrix_S_Phase: any = eval(simulation.results.matrix_S);
      let labelsSPhase: number[] = [];
      project?.signal?.signalValues.forEach((sv) => labelsSPhase.push(sv.freq));
      const datasetsSPhase: Dataset[] = [];
      let matrices_S_Phase_RE: number[][] = [];
      for(let i = 0; i<portNumber*portNumber; i++){
        matrices_S_Phase_RE.push([])
        matrix_S[i].forEach(m => {
          m.forEach((v) => {
            (matrices_S_Phase_RE[i] as Array<number>).push(
                Math.atan2(v[1], v[0])
            )
          })
        })
      }
      matrices_S_Phase_RE.forEach((matrix, index) => {
        if(selectedLabel.filter(l => l.label === "All Ports").length > 0){
          datasetsSPhase.push({
            label:  `${labels[index][0]} - ${labels[index][1]}`,
            data: matrix,
            borderColor: colorArray[index],
            backgroundColor: "white",
          });
        }else{
          selectedLabel.forEach((l) => {
            if(index === l.id){
              datasetsSPhase.push({
                label:  l.label,
                data: matrix,
                borderColor: colorArray[index],
                backgroundColor: "white",
              });
            }
          })
        }
      });

      const optionsSPhase = {
        responsive: true,
        plugins: {
          legend: {
            position: "top" as const,
          },
          title: {
            display: true,
            text: simulation ? `${simulation.name} - S Phase` : "",
          },
        },
        layout: {
          padding: {
            right: 20,
          },
        },
      };

      const dataSPhase = {
        labels: labelsSPhase,
        datasets: datasetsSPhase,
      };
      result.data = dataSPhase;
      result.options = optionsSPhase;
      break;
    case "S_dB":
      // let matrix_S_dB: any = eval(simulation.results.matrix_S);
      let labelsSdB: number[] = [];
      project?.signal?.signalValues.forEach((sv) => labelsSdB.push(sv.freq));
      const datasetsSdB: Dataset[] = [];
      let matrices_S_dB_RE: number[][] = [];
      for(let i = 0; i<portNumber*portNumber; i++){
        matrices_S_dB_RE.push([])
        matrix_S[i].forEach(m => {
          m.forEach((v) => {
            (matrices_S_dB_RE[i] as Array<number>).push(
                20 * Math.log10(Math.sqrt(v[0] * v[0] + v[1] * v[1]))
            )
          })
        })
      }
      matrices_S_dB_RE.forEach((matrix, index) => {
        if(selectedLabel.filter(l => l.label === "All Ports").length > 0){
          datasetsSdB.push({
            label:  `${labels[index][0]} - ${labels[index][1]}`,
            data: matrix,
            borderColor: colorArray[index],
            backgroundColor: "white",
          });
        }else{
          selectedLabel.forEach((l) => {
            if(index === l.id){
              datasetsSdB.push({
                label:  l.label,
                data: matrix,
                borderColor: colorArray[index],
                backgroundColor: "white",
              });
            }
          })
        }
      });

      const optionsSdB = {
        responsive: true,
        plugins: {
          legend: {
            position: "top" as const,
          },
          title: {
            display: true,
            text: simulation ? `${simulation.name} - S dB` : "",
          },
        },
        layout: {
          padding: {
            right: 20,
          },
        },
      };

      const dataSdB = {
        labels: labelsSdB,
        datasets: datasetsSdB,
      };
      result.data = dataSdB;
      result.options = optionsSdB;
      break;
    default:
      break;
  }
  return result;
};
export const pairs = (a:string[]) => {
  return a.flatMap( (x:string) => {
    return a.flatMap( (y:string) => {
      return [[x,y]]
    });
  });
}
