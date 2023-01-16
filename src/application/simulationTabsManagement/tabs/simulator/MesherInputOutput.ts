export type MesherOutput = {
    n_materials: number,
    materials: Map<number, string>,
    origin: Origin,
    cell_size: CellSize,
    n_cells: NCells
    mesher_matrices: Map<string, boolean[][][]>
}

type Origin = {
    origin_x: number,
    origin_y: number,
    origin_z: number,
}

type CellSize = {
    cell_size_x: number,
    cell_size_y: number,
    cell_size_z: number,
}

type NCells = {
    n_cells_x: number,
    n_cells_y: number,
    n_cells_z: number,
}
