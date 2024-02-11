import {useCallback, useContext} from 'react';
import { setChonkyDefaults, thunkRequestFileAction } from "chonky";
import { ChonkyIconFA } from "chonky-icon-fontawesome";
import { FullFileBrowser, ChonkyActions } from "chonky";
import { useEffect, useState } from "react";
import folderSearch from "./folderSearch";
import { customActions } from "./chonkyCustomActions";
import { findFile } from "./folderSearch";
import AuthContext from '../store/auth-context';

export default function Storage() {
  const handleActionWrapper = (data:any) => {
    handleAction(data, setCurrentFolder);
  };
  setChonkyDefaults({ iconComponent: ChonkyIconFA });
  
  const [currentFolder, setCurrentFolder] = useState("0");
  const [loadedList, setLoadedList] = useState<any>([]);
  const [files, setFiles] = useState<any>(null);
  const [folderChain, setFolderChain] = useState<any>(null);
  const fileActions = [...customActions, ChonkyActions.DownloadFiles];
  
  console.log("start", loadedList);
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
        let files: any = [];
        for (const key in data) {
          console.log(key,data);
          const file: any = {
            id: data[key].id,
            isDir: data[key].name.includes('/'),
            name: data[key].name.slice(0, -1),
            modDate: data[key].modifiedDate,
            size: data[key].size,
            url: data[key].url,
            files: [],
          };
          files.push(file);
        }
        setLoadedList(files);
        console.log(files);
      });
      // return loadedList;
  }, [token]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  console.log(loadedList);
  const nestedList = (fileName: string, fileId:string, dataList: any) => {
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
        let listData = [...dataList]; 
        console.log(listData);
        const objIndex = listData.findIndex((obj:any) => obj.id === fileId);
        console.log(objIndex);
        console.log(listData[objIndex]);
        listData[objIndex] = {...listData[objIndex], files: [...files]}
        console.log(listData);
        console.log(files);
      });
      console.log(loadedList);
  };

  const handleAction = (data:any, setCurrentFolder:any) => {
    console.log("handle", data);
    if (data.id === ChonkyActions.OpenFiles.id) {
      const file = findFile(loadedList, data.payload.files[0].id);
      // console.log(file);
      console.log(loadedList);
      nestedList(file.name, file.id, loadedList);
      console.log(loadedList);
      if (file?.isDir) {
        console.log("fileid", file.id);
        setCurrentFolder(file.id);
      }
    }
  };

  useEffect(() => {
    let folderChainTemp:any[] = [];
    let filesTemp:any[] = [];
    const [found, filesTemp1, folderChainTemp1] = folderSearch(
      loadedList,
      folderChainTemp,
      currentFolder
    );
    if (found) {
      console.log("found", filesTemp1, folderChainTemp1);
      filesTemp = filesTemp1;
      folderChainTemp = folderChainTemp1;
    }

    console.log("files", filesTemp);
    console.log("folders", folderChainTemp);
    setFolderChain(folderChainTemp);
    console.log(filesTemp);
    setFiles(filesTemp);
  }, [currentFolder]);

  return (
    <div className="App">
      <h1>Chonky example</h1>
      <FullFileBrowser
        files={loadedList}
        folderChain={folderChain}
        defaultFileViewActionId={ChonkyActions.EnableListView.id}
        fileActions={fileActions}
        onFileAction={handleActionWrapper}
        disableDefaultFileActions={true}
      />
    </div>
  );
}
