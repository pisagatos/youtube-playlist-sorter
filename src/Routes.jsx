import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PlaylistSorter from "./playlist-sorter/PlaylistSorter";
import Thumbnails from "./thumbnails/Thumbnails";
import Database from "./database/Database";

const routes = createBrowserRouter([
    {
        path: "youtube-tools/playlist-sorter",
        element: <PlaylistSorter />,
    },
    {
        path: "thumbnails/:playlistId/:videoId",
        element: <Thumbnails />,
    },
    {
        path: "database/:playlistId",
        element: <Database />,
    }
]);

function Routes() {
    return <RouterProvider routes={routes} />;
}

export default Routes;