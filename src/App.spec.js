// import {fireEvent, render,screen} from "@testing-library/react";
import {fireEvent, render,screen} from "./test/setup";

import App from "./App"
import userEvent from "@testing-library/user-event"
import {setupServer} from 'msw/node';
import {rest} from "msw"
import storage from "./state/storage"
// import { MemoryRouter} from "react-router-dom";
// import { BrowserRouter } from "react-router-dom/cjs/react-router-dom.min";
// import AuthContextWrapper from "./state/AuthContextWrapper";


let logoutCount=0;
let header;
const server=setupServer(
    rest.post('/api/1.0/users/token/:token',(req,res,ctx)=>{
        return res(ctx.status(200))
    }),
    rest.get('/api/1.0/users',(req,res,ctx)=>{
        return res(ctx.status(200),
        ctx.json(
                    {
                        content:[{
                            id:1,
                            username:'adamsin',
                            email:'user@mail.com',
                            image:null
                        }],
                        page:0,
                        size:0,
                        totalPages:0
                    }
                )
            )
    }),
    rest.get("/api/1.0/users/:id",(req,res,ctx)=>{
        const id=Number.parseInt(req.params.id);
        header=req.headers.get("Authorization")
        if(id===1){
            return res(
                ctx.json(
                    {
                        id:1,
                        username:'adamsin',
                        email:'user@mail.com',
                        image:null  
                    })
            )
        }
        return res(
            ctx.json({
                id,
                username:'user'+id,
                email:'user'+id+'@mail.com',
                image:null
                })
            )
        }),
    
    rest.post('/api/1.0/auth',(req,res,ctx)=>{
        return res(ctx.status(200),ctx.json({id:5,username:"user5"}))
    }),

    rest.post('/api/1.0/logout',(req,res,ctx)=>{
        logoutCount+=1
        return res(ctx.status(200))
    }),

    rest.delete("/api/1.0/users/:id",(req,res,ctx)=>{

        return res(ctx.status(200))
    })

);

beforeEach(()=>{
    logoutCount=0
    server.resetHandlers()
})

beforeAll(()=>server.listen())

afterAll(()=>server.close())

afterEach(()=>{

    // localStorage.clear()
    storage.clear()

})

const setup=(path)=>{
    window.history.pushState({},"",path)
    render(
        // <BrowserRouter>
        //     <AuthContextWrapper>
                <App/>          //WE DON'T NEED THEM ANYMORE SINCE WE HAVE CUSTOM RENDER
        //     </AuthContextWrapper>
        // </BrowserRouter>
        )
}

describe("Routing",()=>{

    it.each `
        path | pageTestId
        ${'/'}|${"home-page"}
        ${'/signup'}|${"signup-page"}
        ${'/login'}|${"login-page"}
        ${'/users/1'}|${"user-page"}
        ${'/users/2'}|${"user-page"}
        ${'/activate/123'}|${'activation-page'}
        ${'/activate/456'}|${'activation-page'}

    `('displays $pageTestId when path is $path',({path,pageTestId})=>{

        setup(path);
        const page=screen.queryByTestId(pageTestId)
        expect(page).toBeInTheDocument()
    })

    it.each `
        path | pageTestId

        ${'/'}|${"singup-page"}
        ${'/'}|${"login-page"}
        ${'/'}|${"user-page"}
        ${'/'}|${"activation-page"}

        ${'/signup'}|${"home-page"}
        ${'/signup'}|${"login-page"}
        ${'/signup'}|${"user-page"}
        ${'/signup'}|${"activation-page"}

        ${'/login'}|${"home-page"}
        ${'/login'}|${"signup-page"}
        ${'/login'}|${"user-page"}
        ${'/login'}|${"activation-page"}

        ${'/users/1'}|${"home-page"}
        ${'/users/1'}|${"singup-page"}
        ${'/users/1'}|${"login-page"}
        ${'/users/1'}|${"activation-page"}

        ${'/activate/dasdas1A'}|${"home-page"}
        ${'/activate/dasdas1A'}|${"singup-page"}
        ${'/activate/dasdas1A'}|${"login-page"}
        ${'/activate/dasdas1A'}|${"user-page"}

    `('does not display $pageTestId when path is $path',({path,pageTestId})=>{

        setup(path);
        const page=screen.queryByTestId(pageTestId)
        expect(page).not.toBeInTheDocument()

    })

    it.each `
        targetPage
        ${'Home'}
        ${'Sign Up'}
        ${'Login'}
    `('has link to $targetPage on NavBar',({targetPage})=>{
        setup("/");
        const link=screen.getByRole("link",{name:targetPage})
        expect(link).toBeInTheDocument()
    })


    it.each `
        initialPath |   clickingTo      |   visiblePage
        ${'/'}      |   ${'Sign Up'}    |   ${'signup-page'}
        ${'/signup'}      |   ${'Home'}    |   ${'home-page'}
        ${'/'}      |   ${'Login'}    |   ${'login-page'}

    `('displays $visiblePage after clicking on $clickingTo',({initialPath,clickingTo,visiblePage})=>{
        setup(initialPath);
        const link=screen.getByRole("link",{name:clickingTo})
        userEvent.click(link)
        expect(screen.getByTestId(visiblePage)).toBeInTheDocument()
    })

    it('displays homepage when clicking on brand logo',()=>{

        setup('/login');
        const logo=screen.queryByAltText('Hoaxify');
        userEvent.click(logo)
        expect(screen.getByTestId('home-page')).toBeInTheDocument()

    })

    it('navigates to user page when clicking on user list',async()=>{

        setup("/")
       
        await screen.findByText("adamsin")
        const user=await screen.findByText("adamsin")
        userEvent.click(user)

        const page=await screen.findByTestId('user-page')
        expect(page).toBeInTheDocument()
    });
});

describe('Login',()=>{

    let logoutLink;
    const setupLoggedIn=()=>{
        setup("/login")
        userEvent.type(screen.getByLabelText('Email'),'user5@mail.com')
        userEvent.type(screen.getByLabelText('Password'),'P4ssword')
        userEvent.click(screen.getByRole('button'),{name:'Login'})
        logoutLink=screen.queryByRole("link",{name:"Logout"})

    }

    

    it("redirects to homepage after successful login",async()=>{

        setupLoggedIn();
        const page=await screen.findByTestId('home-page')
        expect(page).toBeInTheDocument()

    })

    it("hides Login and Sign Up from navbar after successful login",async ()=>{

        setupLoggedIn();
        await screen.findByTestId('home-page')
        const loginLink=screen.queryByRole("link",{name:"Login"})
        const signUpLink=screen.queryByRole("link",{name:"Sign Up"})
        expect(loginLink).not.toBeInTheDocument();
        expect(signUpLink).not.toBeInTheDocument();
    })

    it('displays My Profile link on navbar after successful login',async()=>{

        setup("/login");
        const myProfileLinkBeforeLogin=screen.queryByRole("link",{name:"My Profile"})
        expect(myProfileLinkBeforeLogin).not.toBeInTheDocument();
        userEvent.type(screen.getByLabelText('Email'),'user5@mail.com')
        userEvent.type(screen.getByLabelText('Password'),'P4ssword')
        userEvent.click(screen.getByRole('button'),{name:'Login'})
        await screen.findByTestId('home-page')
        const myProfileLinkAfterLogin=screen.queryByRole("link",{name:"My Profile"})
        expect(myProfileLinkAfterLogin).toBeInTheDocument();

    })

    it('displays user page with logged in user id in utl after clicking My Profile link',async()=>{

        setupLoggedIn();
        await screen.findByTestId('home-page')
        const myProfile=screen.queryByRole("link",{name:"My Profile"})
        userEvent.click(myProfile)

        const page=await screen.findByTestId('user-page')
        expect(page).toBeInTheDocument()
        const username=await screen.findByText('user5')
        expect(username).toBeInTheDocument()
    })

    it("stores logged in state in local storage",async()=>{

        setupLoggedIn();
        await screen.findByTestId('home-page')
        // const state=JSON.parse(localStorage.getItem('auth'))
        const state=storage.getItem('auth')

        expect(state.isLoggedIn).toBeTruthy()
    })

    it('displays layout of logged in state',async()=>{

        // localStorage.setItem("auth",JSON.stringify({isLoggedIn:true}))
        storage.setItem("auth",{isLoggedIn:true})
        setup("/")
        await screen.findByTestId('home-page')

        const myProfile=screen.queryByRole("link",{name:"My Profile"})
        expect(myProfile).toBeInTheDocument()
    })

    it("refreshes user page from another user to the logged in user after clicking My Profile",async()=>{

        storage.setItem("auth",{id:5,username:"user5",isLoggedIn:true})
        setup("/")
        await screen.findByTestId('home-page')
        const user=await screen.findByText("adamsin")
        screen.debug()
        userEvent.click(user)

        await screen.findByRole("heading",{name:"adamsin"})
        screen.debug()


        const myProfile=screen.queryByRole("link",{name:"My Profile"})
        userEvent.click(myProfile)
        const user5=await screen.findByRole("heading",{name:"user5"})
        expect(user5).toBeInTheDocument()

    })

})

describe('Logout',()=>{

    let logoutLink;

    const setupLoggedIn=()=>{
        storage.setItem('auth',{id:5,username:"user5",isLoggedIn:true,header:"auth header value"})
        setup("/");
        logoutLink=screen.queryByRole("link",{name:"Logout"})

    }

    it('displays logout link on navbar after successful login',()=>{

        setupLoggedIn()
        expect(logoutLink).toBeInTheDocument()
    })

    it('displays login and sign up on navbar after clicking logout',async()=>{

        setupLoggedIn()
        userEvent.click(logoutLink)
        const loginlink=await screen.findByRole("link",{name:"Login"})
        const signupLink=await screen.findByRole("link",{name:"Sign Up"})
        expect(loginlink).toBeInTheDocument()
        expect(signupLink).toBeInTheDocument()

    })

    it('sends logout request to backend after clicking logout',async()=>{

        setupLoggedIn()
        userEvent.click(logoutLink)
        await screen.findByRole("link",{name:"Login"})
        expect(logoutCount).toBe(1)

    })

    it("removes authorization header from requests after user logs out",async()=>{

        setupLoggedIn()
        userEvent.click(logoutLink)
        await screen.findByRole("link",{name:"Login"})
        const user=screen.queryByText("adamsin")
        userEvent.click(user)
        await screen.findByRole("heading",{name:"adamsin"})
        expect(header).toBeFalsy()

    })
})

describe("Delete User",()=>{

    let deleteButton;
    const setupLoggedInUserPage=async()=>{
        storage.setItem('auth',{id:5,username:"user5",isLoggedIn:true,header:"auth header value"})
        setup("/users/5");
        deleteButton=await screen.findByRole("button",{name:"Delete My Account"})
    }

    it("redirects to homepage after deleting user",async()=>{
        await setupLoggedInUserPage()
        userEvent.click(deleteButton)
        screen.debug()
        userEvent.click(screen.queryByRole("button",{name:"Yes"}))
        await screen.findByTestId("home-page");
    })

    it("displays login and a sign up on navbar after deleting user",async()=>{

        await setupLoggedInUserPage()
        userEvent.click(deleteButton)
        userEvent.click(screen.queryByRole("button",{name:"Yes"}))
        screen.debug()
        await screen.findByRole("link",{name:"Login"})
    })

})

console.error=()=>{};
