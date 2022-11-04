import {ComponentEntity} from "cad-library";

export type Port = {
    name: string,
    category: 'port' | 'lumped',
    type: number,
    inputElement: ComponentEntity,
    outputElement: ComponentEntity,
    isSelected: boolean,
    rlcParams: RLCParams,
}

export type TempLumped = {
    value: number
}&Port

export type RLCParams = {
    inductance?: number,
    resistance?: number,
    capacitance?: number,
}

export interface Signal {
    id: string,
    name: string,
    type: string,
    signalValues: SignalValues[]
    powerPort: string | undefined
}

export interface SignalValues {
    freq: number,
    signal: {
        Re: number,
        Im: number
    }
}

export type Probe = {
    name: string,
    category: 'probe',
    isSelected: boolean,
    elements: ComponentEntity[],
    groupPosition: [number, number, number]
}