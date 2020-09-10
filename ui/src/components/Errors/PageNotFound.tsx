import React from 'react';
import { Link } from 'react-router-dom';

class PageNotFound extends React.Component{
    render(){
        return <div>
            <p style={{textAlign:"center"}}>
                404 Error : Page Not Found
              <Link to="/">Go to Home </Link>
            </p>
          </div>;
    }
}
export default PageNotFound;