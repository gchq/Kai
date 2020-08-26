
import ViewGraph from "../ViewGraph/ViewGraph";
import AddGraph from "../AddGraph/AddGraph";

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
];

export default Routes;