import { ADD_VIDEO, ADD_VIDEOS, REMOVE_VIDEO, REMOVE_ALL_VIDEOS, VIDEO_PROGRESS, VIDEO_COMPLETE } from "./types";
import { ipcRenderer } from "electron";


export const addVideos = videos => dispatch => {
  ipcRenderer.send('convertor:videos:added', videos);
  ipcRenderer.on('convertor:videos:metadata', (event,videosMetadata) => {
    dispatch({
      type: ADD_VIDEOS,
      payload: videosMetadata
    });
  });
};



export const convertVideos = () => (dispatch, getState) => {
  const { videos } =  getState();
  ipcRenderer.send('convertor:videos:convert:start', videos);
  ipcRenderer.on('convertor:videos:convert:end', (event, { video, outputPath }) => {
    dispatch({
      type: VIDEO_COMPLETE,
      payload: {...video,outputPath}
    });
  })

  ipcRenderer.on('convertor:videos:convert:progress', (event, { video, timemark }) => {
    dispatch({
      type: VIDEO_PROGRESS,
      payload: {...video,timemark}
    });
  })

};


export const showInFolder = outputPath => dispatch => {
  ipcRenderer.send('convertor:videos:showInFolder', outputPath);
};

export const addVideo = video => {
  return {
    type: ADD_VIDEO,
    payload: { ...video }
  };
};

export const setFormat = (video, format) => {
  return {
    type: ADD_VIDEO,
    payload: { ...video, format, err: "" }
  };
};

export const removeVideo = video => {
  return {
    type: REMOVE_VIDEO,
    payload: video
  };
};

export const removeAllVideos = () => {
  return {
    type: REMOVE_ALL_VIDEOS
  };
};
