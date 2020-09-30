import ViewGraph from '../ViewGraph/ViewGraph';
import AddGraph from '../AddGraph/AddGraph';
import UserGuide from '../UserGuide/UserGuide';
import UserLogin from "../UserLogin/UserLogin";

const Routes = [
    {
        path: '/UserLogin',
        sidebarName: 'User Login',
        component: UserLogin,
    },
    {
        path: '/AddGraph',
        sidebarName: 'Add Graph',
        component: AddGraph,
    },
    {
        path: '/ViewGraph',
        sidebarName: 'View Graphs',
        component: ViewGraph,
    },
    {
        path: '/UserGuide',
        sidebarName: 'User Guide',
        component: UserGuide,
    },
];

export default Routes;
