import * as React from "react"
import { Box, List, ButtonGroup, Button , Badge, Typography, Divider} from "@mui/material"
import NavBar from "../components/NavBar"
import ManageRequestsRequests from "../components/ManageRequestsRequests"
import ManageRequestsFriends from "../components/ManageRequestsFriends"
import ManageRequestsFollowing from "../components/ManageRequestsFollowing"
import ManageRequestsFollowers from "../components/ManageRequestsFollowers"

export default function ManageRequests(): JSX.Element {
    const [listDisplay, setListDisplay] = React.useState({title:'Follow Requests',id:0});

    //Some fake data to help with layouts
    const followRequests = [
        {
        id:"07a931d8-b181-473d-8838-22dfb5c81416",
        displayName:"Lara Croft",
        },
        {
        id:"c3293ed4-e55e-4986-8311-5ad43a27f5a3",
        displayName:"Nathan Drake",
        },
    ];

    const friends = [
        {
        id:"07a931d8-b181-473d-8838-22dfb5c81416",
        displayName:"Lara Croft",
        profileImage:null,
        },
        {
        id:"c3293ed4-e55e-4986-8311-5ad43a27f5a3",
        displayName:"Nathan Drake",
        profileImage:"",
        },
    ];

    const following = [
        {
        id:"07a931d8-b181-473d-8fdssd8-22dfb5c81416",
        displayName:"Tony Stark",
        profileImage:null,
        },
        {
        id:"c3293ed4-e55e-4986-8311-5ad43a27f5a3",
        displayName:"The Rock",
        profileImage:"",
        },
    ];

    const followers = [
        {
        id:"07a931d8-b181-473d-8fdssd8-22dfb5c81416",
        displayName:"Chris Hemsworth",
        profileImage:null,
        },
        {
        id:"c3293ed4-e55e-4986-8311-5ad43a27f5a3",
        displayName:"Kevin Hart",
        profileImage:"",
        },
    ];

    // Get length for badges
    const totalRequests = followRequests.length;
    const totalFriends = friends.length;
    const totalFollowing = following.length;
    const totalFollowers = followers.length;

    let buttonSx = {
        justifyContent:"space-between", 
        display: "flex"
    }

    let badgeSx = {
        justifyContent:"right", 
        mx:3
    }

    // Sidebar Button group
    const buttons = [
        <Button onClick={()=>setListDisplay({title:'Follow Requests',id:0})}key="requests" sx={buttonSx}> Requests <Badge badgeContent={totalRequests} color="secondary" sx={badgeSx}/></Button>,
        <Button onClick={()=>setListDisplay({title:'Friends',id:1})} key="friends" sx={buttonSx}> Friends <Badge badgeContent={totalFriends} color="secondary" sx={badgeSx}/></Button>,
        <Button onClick={()=>setListDisplay({title:'Following',id:2})}key="following" sx={buttonSx}> Following <Badge badgeContent={totalFollowing} color="secondary" sx={badgeSx}/></Button>,
        <Button onClick={()=>setListDisplay({title:'Followers',id:3})}key="followers" sx={buttonSx}> Followers <Badge badgeContent={totalFollowers} color="secondary" sx={badgeSx}/></Button>,
    ];

    // Lists to display per button
    const lists=[
        followRequests.map((user) => (
            <ManageRequestsRequests user={user} key={user.id}/>
        )),
        friends.map((friend) => (
            <ManageRequestsFriends user={friend} key={friend.id}/>
        )),
        following.map((user) => (
            <ManageRequestsFollowing user={user} key={user.id}/>
        )),
        followers.map((user) => (
            <ManageRequestsFollowers user={user} key={user.id}/>
        ))
    ];
      
    return (
    <>
    <Box sx={{ height: window.innerHeight,width: window.innerWidth}}>
        <Box style={{ height: '5%' }} sx={{ bgcolor:"#fff"}}>
            <NavBar items={[
            {
                Text: "",
                handleClick: () => {
                console.log(1);
                },
            },
            ]} />
        </Box>
        <Box style={{ display: 'flex', height: "95%" }} sx={{ bgcolor:"#fff"}}>
            <Box display="flex" sx={{
                    flexDirection: 'column',
                    width: '30%',
                    alignItems: 'center',
                    bgcolor:"#fff",
                    ml:2,
                    mt:9,
                }}>

                <ButtonGroup
                    orientation="vertical"
                    aria-label="vertical contained button group"
                    variant="contained"
                    size="large"
                    fullWidth={true}
                >
                    {buttons}
                </ButtonGroup>
                
                {listDisplay.title ==='Authors'?(
                    <Button onClick={()=>alert("Add Author Page")} variant='contained' fullWidth={true} sx={{mt:5}}>Add</Button>
                ):null}

                {listDisplay.title==='Nodes'?(
                     <Button onClick={()=>alert("Add Node Page")} variant='contained' fullWidth={true} sx={{mt:5}}>Add</Button>
                ):null}
    
            </Box>

            <Box overflow="auto" display="flex" sx={{
                flexDirection: 'column',
                width: '70%',
                alignItems: 'center',
                mt:0.5
            }}>
                <Typography variant="h4">{listDisplay.title}</Typography>
                <Divider style={{width:'85%'}}></Divider>
                <List style={{maxHeight: '100%', overflow: 'auto'}}>
                    {lists[listDisplay.id]}
                </List>
            </Box>
        </Box>
    </Box>
    </>
)
}