import {UsersState} from "cad-library";
import {Project} from "./Project";

export type Folder = {
    name: string,
    owner: UsersState,
    sharedWith?: string[],
    projectList: Project[],
    subFolders: Folder[],
    parent: string,
    faunaDocumentId?: string
}