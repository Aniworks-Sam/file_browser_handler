import {
  FileBrowser, 
  FileNavbar, 
  FileToolbar, 
  FileList, 
  ChonkyActions,
  FileContextMenu, 
  setChonkyDefaults, 
  ChonkyFileActionData,
  FileArray,
  FileBrowserProps,
  FileData,
  FileHelper,
  FileAction,
  FileBrowserHandle
} from 'chonky';
import React, { useCallback, useEffect, useContext, useMemo, useRef, useState } from 'react';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';
import Button from '@mui/material/Button';
import AuthContext from '../store/auth-context';
setChonkyDefaults({ iconComponent: ChonkyIconFA });

// We define a custom interface for file data because we want to add some custom fields
// to Chonky's built-in `FileData` interface.
interface CustomFileData extends FileData {
  parentId?: string;
  childrenIds?: string[];
}

interface CustomFileMap {
  [fileId: string]: CustomFileData;
}

const useCustomFileMap = () => {
  const [loadedList, setLoadedList] = useState<any>([]);
  console.log(loadedList);
  const authCtx = useContext(AuthContext);
  const token = authCtx.token;
  const fetchData = useCallback(() => {
    // setIsLoading(true);
    fetch('https://anisoft.us/mailapp/api/data/listfolder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token': token,
      },
      body: JSON.stringify({}),
    })
      .then((response) => {
        console.log(response);
        return response.json();
      })
      .then((data) => {
        console.log(data);
        const files: any = [];
        for (const key in data) {
          console.log(key,data);
          const file: any = {
            id: key,
            isDir: data[key].name.includes('/'),
            name: data[key].name.slice(0, -1),
            modDate: data[key].modifiedDate,
            size: data[key].size,
            url: data[key].url,
            childrenIds: [],
          };
          files.push(file);
        }
        setLoadedList(files);
        console.log(files);
      });
      return loadedList;
  }, [token]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const nestedList = useCallback((fileName: string, fileId: string) => {
    console.log(fileId);
    fetch(`https://anisoft.us/mailapp/api/data/listfolder?name=${fileName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token': token,
      },
      body: JSON.stringify({}),
    })
      .then((response) => {
        console.log(response);
        return response.json();
      })
      .then((data) => {
        console.log(data);
        const files: any = [];
        for (const key in data) {
          console.log(key,data);
          const file: any = {
            id: data[key].id,
            isDir: data[key].name.includes('/'),
            name: data[key].name,
            modDate: data[key].modifiedDate,
            size: data[key].size,
            url: data[key].url,
          };
          files.push(file);
        }
        const ids = files.map((s:any) =>s.id);
        setLoadedList((prevState:any) => [...prevState, ...files, prevState[0].childrenIds.push(...ids)]);
        console.log(files);
      });
      return loadedList;
  },[]);

  // Function that will be called when user deletes files either using the toolbar
  // button or `Delete` key.
  const deleteFiles = useCallback((files: CustomFileData[]) => {
    fetch(`https://anisoft.us/mailapp/api/data/folder?name=${files}`, {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Token': token,
        },
      })
        .then((res) => {
          if (res.ok) {
            console.log(res);
            return res.text();
          } else {
            return res.json().then((data) => {
              let errorMessage = 'Authentication failed!';
              throw new Error(errorMessage);
            });
          }
        })
        .then((data) => {
          fetchData();
          console.log(data);
          return data;
        })
        .catch((err) => {
          console.error(err.message);
          alert(err.message);
        });
  }, [token]);

  // Function that will be called when files are moved from one folder to another
  // using drag & drop.
  // const moveFiles = useCallback(
  //   (
  //       files: CustomFileData[],
  //       source: CustomFileData,
  //       destination: CustomFileData
  //   ) => {
  
  //   },
  //   []
  // );

  // Function that will be called when user creates a new folder using the toolbar
  // button.
  const createFolder = useCallback((folderName: string) => {
    fetch(`https://anisoft.us/mailapp/api/data/folder?name=${folderName}`, {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Token': token,
        },
      })
        .then((res) => {
          if (res.ok) {
            console.log(res);
            return res.text();
          } else {
            return res.json().then((data) => {
              let errorMessage = 'Authentication failed!';
              throw new Error(errorMessage);
            });
          }
        })
        .then((data) => {
          fetchData();
          console.log(data);
          return data;
        })
        .catch((err) => {
          console.error(err.message);
          alert(err.message);
        });
  }, [token]);

  return {
      loadedList,
      nestedList,
      deleteFiles,
      // moveFiles,
      createFolder,
  };
};

export const useFiles = (
  fileMap: CustomFileMap,
  currentFolderId: string
): FileArray => {
  return useMemo(() => {
      const currentFolder = fileMap[currentFolderId];
      const childrenIds = currentFolder.childrenIds!;
      const files = childrenIds.map((fileId: string) => fileMap[fileId]);
      return files;
  }, [currentFolderId, fileMap]);
};

export const useFolderChain = (
  fileMap: CustomFileMap,
  currentFolderId: string
): FileArray => {
  return useMemo(() => {
      const currentFolder = fileMap[currentFolderId];

      const folderChain = [currentFolder];

      let parentId = currentFolder.parentId;
      while (parentId) {
          const parentFile = fileMap[parentId];
          if (parentFile) {
              folderChain.unshift(parentFile);
              parentId = parentFile.parentId;
          } else {
              break;
          }
      }

      return folderChain;
  }, [currentFolderId, fileMap]);
};

export const useFileActionHandler = (
  // setCurrentFolderId: (folderId: string) => void,
  deleteFiles: (files: CustomFileData[]) => void,
  // moveFiles: (files: FileData[], source: FileData, destination: FileData) => void,
  createFolder: (folderName: string) => void,
  ) => {
  const fileBrowserRef = React.useRef(null)
  const {nestedList} = useCustomFileMap();
  return useCallback(
      (data: ChonkyFileActionData) => {
          console.log(data.id, ChonkyActions.OpenFiles.id);
          if (data.id === ChonkyActions.OpenFiles.id) {
            console.log(data.payload.targetFile, data.payload.files);
              const { targetFile, files } = data.payload;
              const fileToOpen = targetFile ?? files[0];
              console.log(fileToOpen);
              if (fileToOpen && FileHelper.isDirectory(fileToOpen)) {
                // setCurrentFolderId(fileToOpen.name);
                console.log(fileToOpen.name);
                if (!fileBrowserRef.current) return
                // const newSelection = new Set()
                // for (const file of files) {
                //   if (Math.random() > 0.5) newSelection.add(file.id)
                // }
                // fileBrowserRef.current.FileBrowserHandle.setFileSelection(newSelection)
                nestedList(fileToOpen.name, fileToOpen.id);
                // console.log();
                return;
          }
        }
          else if (data.id === ChonkyActions.DeleteFiles.id) {
            console.log(data.state.selectedFilesForAction!);
            // deleteFiles(data.state.selectedFilesForAction!);
          // } else if (data.id === ChonkyActions.MoveFiles.id) {
          //     moveFiles(
          //         data.payload.files,
          //         data.payload.source!,
          //         data.payload.destination
          //     );
          } 
          else if (data.id === ChonkyActions.CreateFolder.id) {
              const folderName = prompt('Provide the name for your new folder:');
              if (folderName) createFolder(folderName);
          }

          // showActionNotification(data);
      },
      [createFolder]
  );
};

export type VFSProps = Partial<FileBrowserProps>;

export const Drive: React.FC<VFSProps> = React.memo((props) => {
  const {
      loadedList,
      // currentFolderId,
      // setCurrentFolderId,
      // resetFileMap,
      deleteFiles,
      // moveFiles,
      createFolder,
  } = useCustomFileMap();
  // const files = useFiles(fileMap, currentFolderId);
  // console.log(files);
  // const folderChain = useFolderChain(loadedList, currentFolderId);
  const handleFileAction = useFileActionHandler(
      // setCurrentFolderId,
      deleteFiles,
      // moveFiles,
      createFolder
  );
  const fileActions = useMemo(
      () => [ChonkyActions.CreateFolder, ChonkyActions.DeleteFiles, ChonkyActions.OpenFiles,
        ChonkyActions.CopyFiles,ChonkyActions.UploadFiles,ChonkyActions.DownloadFiles],
      []
  );
  const thumbnailGenerator = useCallback(
      (file: FileData) =>
          file.thumbnailUrl ? `https://chonky.io${file.thumbnailUrl}` : null,
      []
  );
  const fileBrowserRef = React.useRef<any>(null);

  return (
    <>
      <Button
        size="small"
        color="primary"
        variant="contained"
        // onClick={resetFileMap}
        style={{ marginBottom: 15 }}
      >
        Reset file map
      </Button>
      <div style={{ height: 400 }}>
        <FileBrowser 
          ref={fileBrowserRef} 
          files={loadedList}
          // folderChain={folderChain}
          fileActions={fileActions}
          onFileAction={handleFileAction}
          thumbnailGenerator={thumbnailGenerator}
          >
          <FileNavbar />
          <FileToolbar />
          <FileList />
          <FileContextMenu />
        </FileBrowser>
      </div>
    </>
  );
});
