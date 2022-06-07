import LoginPage from "./LoginPage"

import {render,screen,waitForElementToBeRemoved} from '../test/setup'
import userEvent from "@testing-library/user-event"

import {setupServer} from "msw/node"
import {rest} from "msw"


import storage from "../state/storage"



let requestBody,count;

const server=setupServer(
    rest.post('/api/1.0/auth',(req,res,ctx)=>{
        count+=1
        requestBody=req.body
        return res(ctx.status(401),ctx.json({message:'Incorrect credentials'}))
        })
);



    beforeEach(()=>{
        count=0;
        server.resetHandlers()
    });
    
    beforeAll(()=>server.listen())
    
    afterAll(()=>server.close())

    const loginSuccess=rest.post('/api/1.0/auth',(req,res,ctx)=>{
        requestBody=req.body
        return res(ctx.status(200),ctx.json({id:5,username:'user5',image:null,token:'abcdefgh'}))
        }
    )

describe("Login Page",()=>{
    describe("Layout",()=>{
        it("has header",()=>{
            render(<LoginPage/>)
            const header=screen.queryByRole("heading",{name: "Login"})
            expect(header).toBeInTheDocument()
        })
        

        it("has email input",()=>{
            render(<LoginPage/>)
            const input=screen.getByLabelText("Email")
            expect(input).toBeInTheDocument()
        })

        it("has password input",()=>{
            render(<LoginPage/>)
            const input=screen.getByLabelText("Password")
            expect(input).toBeInTheDocument()
        })

        it("has password type for password input",()=>{
            render(<LoginPage/>)
            const input=screen.getByLabelText("Password")
            expect(input.type).toBe("password")
        })

        it("has Login button",()=>{
            render(<LoginPage/>)
            const button=screen.queryByRole("button",{name: "Login"})
            expect(button).toBeInTheDocument()
        })
        it("disables the button initially",()=>{
            render(<LoginPage/>)
            const button=screen.queryByRole("button",{name: "Login"})
            expect(button).toBeDisabled()
        })

    })

    describe("interactions",()=>{

        let button,emailInput,passwordInput;

        const setup=(email='user100@mail.com')=>{
            render(<LoginPage />)

            emailInput=screen.getByLabelText('Email')
            passwordInput=screen.getByLabelText('Password')
            userEvent.type(emailInput,email)
            userEvent.type(passwordInput,'P4ssword')
            button=screen.queryByRole('button',{name:'Login'})
        }

        it("enables the button when email and password inputs are filled",()=>{

            setup();
            expect(button).toBeEnabled();

        })

        it('displays spinner during api call',async ()=>{

            setup();
            expect(screen.queryByRole('status')).not.toBeInTheDocument()
            userEvent.click(button);
            const spinner=screen.getByRole('status',{hidden:true})
            await waitForElementToBeRemoved(spinner)

        })

        it('sends email and password to backend after clicking the button',async()=>{

            setup();
            userEvent.click(button)
            const spinner=screen.getByRole('status',{hidden:true})
            await waitForElementToBeRemoved(spinner)
            expect(requestBody).toEqual({
                email:'user100@mail.com',
                password:'P4ssword'
            })

        })

        it('disables the button when there is an api call',async()=>{
            setup();
            userEvent.click(button)
            userEvent.click(button)
            const spinner=screen.getByRole('status',{hidden:true})
            screen.debug()

            await waitForElementToBeRemoved(spinner)
            expect(count).toBe(1)
        })

        it('displays authentication fail message',async()=>{

            setup();
            userEvent.click(button);
            const errorMessage=await screen.findByText('Incorrect credentials')
            expect(errorMessage).toBeInTheDocument();
        })

        it('clears authentication fail message when email field is changed',async()=>{

            setup();
            userEvent.click(button);
            const errorMessage=await screen.findByText('Incorrect credentials')
            expect(errorMessage).toBeInTheDocument();

            userEvent.type(emailInput,"new@email.com")
            expect(errorMessage).not.toBeInTheDocument();
        })

        it('clears authentication fail message when password field is changed',async()=>{

            setup();
            userEvent.click(button);
            const errorMessage=await screen.findByText('Incorrect credentials')
            expect(errorMessage).toBeInTheDocument();

            userEvent.type(passwordInput,"newPassword")
            expect(errorMessage).not.toBeInTheDocument();
        })

        it("stores id, username and image in storage",async()=>{
            server.use(loginSuccess)

            setup('user5@mail.com')
            userEvent.click(button)
            const spinner=screen.queryByRole("status",{hidden:'true'})

            screen.debug()
            await waitForElementToBeRemoved(spinner)

            const storedState=storage.getItem("auth")
            const objectFields=Object.keys(storedState)
            expect(objectFields.includes('id')).toBeTruthy()
            expect(objectFields.includes('username')).toBeTruthy()
            expect(objectFields.includes('image')).toBeTruthy()

        })

        it("stores authorization header value in storage",async()=>{

            server.use(loginSuccess)


            setup('user5@mail.com')
            userEvent.click(button)
            const spinner=screen.queryByRole("status",{hidden:'true'})

            screen.debug()
            await waitForElementToBeRemoved(spinner)

            const storedState=storage.getItem("auth")
            expect(storedState.header).toBe('Bearer abcdefgh')
            

        })
    })

})
