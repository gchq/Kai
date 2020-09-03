
import ViewGraph from "../ViewGraph/ViewGraph";
import AddGraph from "../AddGraph/AddGraph";
import UserGuide from "../UserGuide/UserGuide";
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import VisibilityIcon from '@material-ui/icons/Visibility';

const Routes = [
    {
        path: '/AddGraph',
        sidebarName: 'Add Graph',
        component: AddGraph
    },
    {
        path: '/ViewGraph',
        sidebarName: 'View Graph',
        component: ViewGraph
    },
    {
        path: '/UserGuide',
        sidebarName: 'User Guide',
        component: UserGuide

    },

];

export default Routes;

