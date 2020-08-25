import Page1 from "../Page1";
import Page2 from "../Page2";
import AddGraph from "../AddGraph/AddGraph";

const Routes = [
    {
        path: '/AddGraph',
        sidebarName: 'Add Graph',
        component: AddGraph
    },
    {
        path: '/Page2',
        sidebarName: 'Page 2',
        component: Page2
    },
];

export default Routes;