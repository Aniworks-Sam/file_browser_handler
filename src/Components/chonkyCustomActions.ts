import { defineFileAction, ChonkyIconName } from "chonky";

const uploadFileAction = defineFileAction({
  id: "upload",
  fileFilter: (file:any) => file.isDir,
  button: {
    name: "Upload",
    toolbar: true,
    contextMenu: true,
    icon: ChonkyIconName.upload
  }
});

const delegateFileAction = defineFileAction({
  id: "delegate",
  fileFilter: (file:any) => file.isDir,
  button: {
    name: "Delegate",
    toolbar: true,
    contextMenu: true,
    icon: ChonkyIconName.loading
  }
});

const viewFileAction = defineFileAction({
  id: "view",
  requiresSelection: true,
  fileFilter: (file:any) => file && !file.isDir,
  button: {
    name: "View",
    toolbar: true,
    contextMenu: true,
    icon: ChonkyIconName.file
  }
});

export const customActions = [
  viewFileAction,
  delegateFileAction,
  uploadFileAction
];
