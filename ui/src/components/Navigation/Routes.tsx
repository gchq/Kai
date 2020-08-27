
import ViewGraph from "../ViewGraph/ViewGraph";
import AddGraph from "../AddGraph/AddGraph";
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
        path: '#',
        sidebarName: 'User Guide',
    },

];

export default Routes;

