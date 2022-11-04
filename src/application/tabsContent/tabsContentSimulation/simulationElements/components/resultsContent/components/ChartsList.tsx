import React from "react";
import { Simulation } from "../../../../../../../model/Simulation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Project } from "../../../../../../../model/Project";
import { Line } from "react-chartjs-2";

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
  simulation: Simulation;
  project: Project | undefined;
  scaleMode: string;
}

interface Dataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
}

export const ChartsList: React.FC<ChartsListProps> = ({
  simulation,
  project,
  scaleMode,
}) => {
  const chartsOrderedIDs = [
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
  ];
  const chartsDataOptionsList = chartsOrderedIDs.map((id) =>
    chartsDataOptionsFactory(simulation, project, id)
  );

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
        updatedOptions = options;
        break;
      default:
        break;
    }
    return updatedOptions;
  };

  return (
    <>
      {chartsDataOptionsList.map((chartData) => (
        <div className="box w-[100%]">
          <Line
            options={optionsWithScaleMode(chartData.options, scaleMode)}
            data={chartData.data}
          />
        </div>
      ))}
    </>
  );
};

const chartsDataOptionsFactory = (
  simulation: Simulation,
  project: Project | undefined,
  label: string
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
  switch (label) {
    case "R":
      let matrix_Z_ModuleR: any = eval(simulation.results.matrix_Z);

      let labelsR: number[] = [];
      project?.signal?.signalValues.forEach((sv) => labelsR.push(sv.freq));
      const datasetsR: Dataset[] = [];
      let matrices_Z_RER: number[][] = [];
      let matrix_Z_RE_valueR: number[] = [];
      matrix_Z_ModuleR.forEach((mz: any[][]) => {
        matrices_Z_RER.push(matrix_Z_RE_valueR);
        mz.forEach((mz2: any[]) => {
          matrix_Z_RE_valueR.push(mz2[0] * 1000);
        });
      });
      matrices_Z_RER.forEach((matrix, index) => {
        datasetsR.push({
          label: `Port ${index + 1} - R(mOhm)`,
          data: matrix,
          borderColor: colorArray[index],
          backgroundColor: "white",
        });
      });

      const optionsR = {
        responsive: true,
        plugins: {
          legend: {
            position: "top" as const,
          },
          title: {
            display: true,
            text: simulation ? simulation.name : "",
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
      let matrix_ZH: any = eval(simulation.results.matrix_Z);

      let labelsH: number[] = [];
      project?.signal?.signalValues.forEach((sv) => labelsH.push(sv.freq));
      const datasetsH: Dataset[] = [];
      let matrices_Z_IM: number[][] = [];
      let matrix_Z_IM_value: number[] = [];
      matrix_ZH.forEach((mz: any[][]) => {
        matrices_Z_IM.push(matrix_Z_IM_value);
        mz.forEach((mz2: any[], index) => {
          matrix_Z_IM_value.push(
            (mz2[1] / (2 * Math.PI * labelsH[index])) * 1000000000
          );
        });
      });
      matrices_Z_IM.forEach((matrix, index) => {
        datasetsH.push({
          label: `Port ${index + 1} - L(nH)`,
          data: matrix,
          borderColor: colorArray[index],
          backgroundColor: "white",
        });
      });
      const optionsH = {
        responsive: true,
        plugins: {
          legend: {
            position: "top" as const,
          },
          title: {
            display: true,
            text: simulation ? simulation.name : "",
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
      let matrix_Z_Module: any = eval(simulation.results.matrix_Z);

      let labelsZModule: number[] = [];
      project?.signal?.signalValues.forEach((sv) =>
        labelsZModule.push(sv.freq)
      );
      const datasetsZModule: Dataset[] = [];
      let matrices_Z_Module_RE: number[][] = [];
      let matrix_Z_Module_RE_value: number[] = [];
      matrix_Z_Module.forEach((mz: any[][]) => {
        matrices_Z_Module_RE.push(matrix_Z_Module_RE_value);
        mz.forEach((mz2: any[]) => {
          matrix_Z_Module_RE_value.push(
            Math.sqrt(mz2[0] * mz2[0] + mz2[1] * mz2[1])
          );
        });
      });
      matrices_Z_Module_RE.forEach((matrix, index) => {
        datasetsZModule.push({
          label: `Port ${index + 1} - Z Module`,
          data: matrix,
          borderColor: colorArray[index],
          backgroundColor: "white",
        });
      });

      const optionsZModule = {
        responsive: true,
        plugins: {
          legend: {
            position: "top" as const,
          },
          title: {
            display: true,
            text: simulation ? simulation.name : "",
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
      let matrix_Z_Phase: any = eval(simulation.results.matrix_Z);

      let labelsZPhase: number[] = [];
      project?.signal?.signalValues.forEach((sv) => labelsZPhase.push(sv.freq));
      const datasetsZPhase: Dataset[] = [];
      let matrices_Z_Phase_RE: number[][] = [];
      let matrix_Z_Phase_RE_value: number[] = [];
      matrix_Z_Phase.forEach((mz: any[][]) => {
        matrices_Z_Phase_RE.push(matrix_Z_Phase_RE_value);
        mz.forEach((mz2: any[]) => {
          matrix_Z_Phase_RE_value.push(Math.atan2(mz2[1], mz2[0]));
        });
      });
      matrices_Z_Phase_RE.forEach((matrix, index) => {
        datasetsZPhase.push({
          label: `Port ${index + 1} - Z Phase`,
          data: matrix,
          borderColor: colorArray[index],
          backgroundColor: "white",
        });
      });

      const optionsZPhase = {
        responsive: true,
        plugins: {
          legend: {
            position: "top" as const,
          },
          title: {
            display: true,
            text: simulation ? simulation.name : "",
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
      let matrix_YG: any = eval(simulation.results.matrix_Y);

      let labelsG: number[] = [];
      project?.signal?.signalValues.forEach((sv) => labelsG.push(sv.freq));
      const datasetsG: Dataset[] = [];
      let matrices_YG_RE: number[][] = [];
      let matrix_YG_RE_value: number[] = [];
      matrix_YG.forEach((mz: any[][]) => {
        matrices_YG_RE.push(matrix_YG_RE_value);
        mz.forEach((mz2: any[]) => {
          matrix_YG_RE_value.push(mz2[0] as number);
        });
      });
      matrices_YG_RE.forEach((matrix, index) => {
        datasetsG.push({
          label: `Port ${index + 1} - G(S)`,
          data: matrix,
          borderColor: colorArray[index],
          backgroundColor: "white",
        });
      });

      const optionsG = {
        responsive: true,
        plugins: {
          legend: {
            position: "top" as const,
          },
          title: {
            display: true,
            text: simulation ? simulation.name : "",
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
      let matrix_YC: any = eval(simulation.results.matrix_Y);

      let labelsC: number[] = [];
      project?.signal?.signalValues.forEach((sv) => labelsC.push(sv.freq));
      const datasetsC: Dataset[] = [];
      let matrices_YC_RE: number[][] = [];
      let matrix_YC_RE_value: number[] = [];
      matrix_YC.forEach((mz: any[][]) => {
        matrices_YC_RE.push(matrix_YC_RE_value);
        mz.forEach((mz2: any[], index) => {
          matrix_YC_RE_value.push(mz2[1] / (2 * Math.PI * labelsC[index]));
        });
      });
      matrices_YC_RE.forEach((matrix, index) => {
        datasetsC.push({
          label: `Port ${index + 1} - C(F)`,
          data: matrix,
          borderColor: colorArray[index],
          backgroundColor: "white",
        });
      });

      const optionsC = {
        responsive: true,
        plugins: {
          legend: {
            position: "top" as const,
          },
          title: {
            display: true,
            text: simulation ? simulation.name : "",
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
      let matrix_Y_Module: any = eval(simulation.results.matrix_Y);

      let labelsYModule: number[] = [];
      project?.signal?.signalValues.forEach((sv) =>
        labelsYModule.push(sv.freq)
      );
      const datasetsYModule: Dataset[] = [];
      let matrices_Y_Module_RE: number[][] = [];
      let matrix_Y_Module_RE_value: number[] = [];
      matrix_Y_Module.forEach((mz: any[][]) => {
        matrices_Y_Module_RE.push(matrix_Y_Module_RE_value);
        mz.forEach((mz2: any[], index) => {
          matrix_Y_Module_RE_value.push(
            Math.sqrt(mz2[0] * mz2[0] + mz2[1] * mz2[1])
          );
        });
      });
      matrices_Y_Module_RE.forEach((matrix, index) => {
        datasetsYModule.push({
          label: `Port ${index + 1} - Y Module`,
          data: matrix,
          borderColor: colorArray[index],
          backgroundColor: "white",
        });
      });

      const optionsYModule = {
        responsive: true,
        plugins: {
          legend: {
            position: "top" as const,
          },
          title: {
            display: true,
            text: simulation ? simulation.name : "",
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
      let matrix_Y_Phase: any = eval(simulation.results.matrix_Y);

      let labelsYPhase: number[] = [];
      project?.signal?.signalValues.forEach((sv) => labelsYPhase.push(sv.freq));
      const datasetsYPhase: Dataset[] = [];
      let matrices_Y_Phase_RE: number[][] = [];
      let matrix_Y_Phase_RE_value: number[] = [];
      matrix_Y_Phase.forEach((mz: any[][]) => {
        matrices_Y_Phase_RE.push(matrix_Y_Phase_RE_value);
        mz.forEach((mz2: any[], index) => {
          matrix_Y_Phase_RE_value.push(Math.atan2(mz2[1], mz2[0]));
        });
      });
      matrices_Y_Phase_RE.forEach((matrix, index) => {
        datasetsYPhase.push({
          label: `Port ${index + 1} - Y Phase`,
          data: matrix,
          borderColor: colorArray[index],
          backgroundColor: "white",
        });
      });

      const optionsYPhase = {
        responsive: true,
        plugins: {
          legend: {
            position: "top" as const,
          },
          title: {
            display: true,
            text: simulation ? simulation.name : "",
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
      let matrix_S_Module: any = eval(simulation.results.matrix_S);

      let labelsSModule: number[] = [];
      project?.signal?.signalValues.forEach((sv) =>
        labelsSModule.push(sv.freq)
      );
      const datasetsSModule: Dataset[] = [];
      let matrices_S_Module_RE: number[][] = [];
      let matrix_S_Module_RE_value: number[] = [];
      matrix_S_Module.forEach((mz: any[][]) => {
        matrices_S_Module_RE.push(matrix_S_Module_RE_value);
        mz.forEach((mz2: any[], index) => {
          matrix_S_Module_RE_value.push(
            Math.sqrt(mz2[0] * mz2[0] + mz2[1] * mz2[1])
          );
        });
      });
      matrices_S_Module_RE.forEach((matrix, index) => {
        datasetsSModule.push({
          label: `Port ${index + 1} - S Module`,
          data: matrix,
          borderColor: colorArray[index],
          backgroundColor: "white",
        });
      });

      const optionsSModule = {
        responsive: true,
        plugins: {
          legend: {
            position: "top" as const,
          },
          title: {
            display: true,
            text: simulation ? simulation.name : "",
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
      let matrix_S_Phase: any = eval(simulation.results.matrix_S);

      let labelsSPhase: number[] = [];
      project?.signal?.signalValues.forEach((sv) => labelsSPhase.push(sv.freq));
      const datasetsSPhase: Dataset[] = [];
      let matrices_S_Phase_RE: number[][] = [];
      let matrix_S_Phase_RE_value: number[] = [];
      matrix_S_Phase.forEach((mz: any[][]) => {
        matrices_S_Phase_RE.push(matrix_S_Phase_RE_value);
        mz.forEach((mz2: any[], index) => {
          matrix_S_Phase_RE_value.push(Math.atan2(mz2[1], mz2[0]));
        });
      });
      matrices_S_Phase_RE.forEach((matrix, index) => {
        datasetsSPhase.push({
          label: `Port ${index + 1} - S Phase`,
          data: matrix,
          borderColor: colorArray[index],
          backgroundColor: "white",
        });
      });

      const optionsSPhase = {
        responsive: true,
        plugins: {
          legend: {
            position: "top" as const,
          },
          title: {
            display: true,
            text: simulation ? simulation.name : "",
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
      let matrix_S_dB: any = eval(simulation.results.matrix_S);

      let labelsSdB: number[] = [];
      project?.signal?.signalValues.forEach((sv) => labelsSdB.push(sv.freq));
      const datasetsSdB: Dataset[] = [];
      let matrices_S_dB_RE: number[][] = [];
      let matrix_S_dB_RE_value: number[] = [];
      matrix_S_dB.forEach((mz: any[][]) => {
        matrices_S_dB_RE.push(matrix_S_dB_RE_value);
        mz.forEach((mz2: any[], index) => {
          matrix_S_dB_RE_value.push(
            20 * Math.log10(Math.sqrt(mz2[0] * mz2[0] + mz2[1] * mz2[1]))
          );
        });
      });
      matrices_S_dB_RE.forEach((matrix, index) => {
        datasetsSdB.push({
          label: `Port ${index + 1} - S dB`,
          data: matrix,
          borderColor: colorArray[index],
          backgroundColor: "white",
        });
      });

      const optionsSdB = {
        responsive: true,
        plugins: {
          legend: {
            position: "top" as const,
          },
          title: {
            display: true,
            text: simulation ? simulation.name : "",
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
