import {UsersState} from "cad-library";
import {Project} from "./Project";

export type Folder = {
    name: string,
    owner: UsersState,
    sharedWith: sharingInfoUser[],
    projectList: Project[],
    subFolders: Folder[],
    parent: string,
    faunaDocumentId?: string
}


export type sharingInfoUser = {
    userEmail: string,
    read: boolean,
    write: boolean
}