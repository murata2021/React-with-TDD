import SignUpPage from "./SignUpPage";
import {render,screen, waitFor,waitForElementToBeRemoved} from '../test/setup';
import userEvent from  "@testing-library/user-event"
import axios from "axios"
import {setupServer} from "msw/node"
import {rest} from "msw"
import { act } from "react-dom/test-utils";



describe("Sign Up Page",()=>{
    describe("Layout",()=>{
        it("has header",()=>{
            render(<SignUpPage/>)
            const header=screen.queryByRole("heading",{name: "Sign Up"})
            expect(header).toBeInTheDocument()
        })
        it("has username input",()=>{
            render(<SignUpPage/>)
            const input=screen.getByLabelText("Username")
            expect(input).toBeInTheDocument()
        })

        it("has email input",()=>{
            render(<SignUpPage/>)
            const input=screen.getByLabelText("Email")
            expect(input).toBeInTheDocument()
        })

        it("has password input",()=>{
            render(<SignUpPage/>)
            const input=screen.getByLabelText("Password")
            expect(input).toBeInTheDocument()
        })

        it("has password type for password input",()=>{
            render(<SignUpPage/>)
            const input=screen.getByLabelText("Password")
            expect(input.type).toBe("password")
        })

        it("has password repeat",()=>{
            render(<SignUpPage/>)
            const input=screen.getByLabelText("Password Repeat")
            expect(input).toBeInTheDocument()
        })

        it("has password type for password repeat input",()=>{
            render(<SignUpPage/>)
            const input=screen.getByLabelText("Password Repeat")
            expect(input.type).toBe("password")
        })

        it("has Sign Up button",()=>{
            render(<SignUpPage/>)
            const button=screen.queryByRole("button",{name: "Sign Up"})
            expect(button).toBeInTheDocument()
        })
        it("disables the button initially",()=>{
            render(<SignUpPage/>)
            const button=screen.queryByRole("button",{name: "Sign Up"})
            expect(button).toBeDisabled()
        })

    })

    describe("Interactions",()=>{
        let button, usernameInput,emailInput, passwordInput,passwordRepeatInput;

        const setup=()=>{
            const {debug}=render(<SignUpPage/>)
            usernameInput=screen.getByLabelText("Username")
            emailInput=screen.getByLabelText("Email")
            passwordInput=screen.getByLabelText("Password")
            passwordRepeatInput=screen.getByLabelText("Password Repeat")

            userEvent.type(usernameInput,"user1")
            userEvent.type(emailInput,"user1@mail.com")
            userEvent.type(passwordInput,"P4ssword")
            userEvent.type(passwordRepeatInput,"P4ssword")
            button=screen.queryByRole("button",{name: "Sign Up"})
        }



        it("enables the button when password and password repeat fields have same value",()=>{

            setup()
            expect(button).toBeEnabled()
        })

    
        it("sends username, email and password to backend after clicking the button",async ()=>{
            
            setup()
            let requestBody;
            const server=setupServer(
                rest.post('/api/1.0/users',(req,res,ctx)=>{
                    requestBody=req.body
                    return res(ctx.status(200))
                })
            )

            server.listen();
            act(()=>{
                userEvent.click(button)
            })

            // await new Promise(resolve=>setTimeout(resolve,500))
            await screen.findByText("Please check your e-mail to activate your account")
        //     const firstCallOfMockFunction=mockFn.mock.calls[0]
        //     const body=firstCallOfMockFunction[1]; //first parameter is url and second one is body

        //     expect(body).toEqual({
        //         username:'user1',
        //         email:'user1@mail.com',
        //         password:"P4ssword"
        //     })
           
            expect(requestBody).toEqual({
                username:'user1',
                email:'user1@mail.com',
                password:"P4ssword"
            })

        })

        it("disables button when there is an ongoing api call",async ()=>{

            setup()
            let counter=0;
            let requestBody;
            const server=setupServer(
                rest.post('/api/1.0/users',(req,res,ctx)=>{
                    requestBody=req.body
                    counter+=1
                    return res(ctx.status(200))
                })
            )

            server.listen();

           
            act(()=>{
                userEvent.click(button)
            })
            act(()=>{
                userEvent.click(button)
            })

            // await new Promise(resolve=>setTimeout(resolve,500)) 
            await screen.findByText("Please check your e-mail to activate your account")   
            expect(counter).toBe(1)

        })


        it("displays spinner while the api request in progress",async ()=>{

            setup()
            let requestBody;
            const server=setupServer(
                rest.post('/api/1.0/users',(req,res,ctx)=>{
                    requestBody=req.body
                    return res(ctx.status(200))
                })
            )

            server.listen();

            
            act(()=>{
                userEvent.click(button)
            })
            const spinner=screen.getByRole('status',{hidden:true})

            expect(spinner).toBeInTheDocument()
            // await new Promise(resolve=>setTimeout(resolve,500))    
            await screen.findByText("Please check your e-mail to activate your account")

        })

        it("does not display the spinner while the api request is not in progress",async ()=>{

            setup()
            const spinner=screen.queryByRole('status',{hidden:true})

            expect(spinner).not.toBeInTheDocument()

        })

        it("displays account activation notification after successful sign up request",async ()=>{

            setup()
            let requestBody;
            const server=setupServer(
                rest.post('/api/1.0/users',(req,res,ctx)=>{
                    requestBody=req.body
                    return res(ctx.status(200))
                })
            )
            server.listen();

            
            act(()=>{
                userEvent.click(button)
            })
            expect(screen.queryByText("Please check your e-mail to activate your account")).not.toBeInTheDocument();
            //findBy works with async
            const message=await screen.findByText("Please check your e-mail to activate your account")
            expect(message).toBeInTheDocument();
        })

        it('hides sign up form after successful sign up request',async()=>{
            
            setup()
            let requestBody;
            const server=setupServer(
                rest.post('/api/1.0/users',(req,res,ctx)=>{
                    requestBody=req.body
                    return res(ctx.status(200))
                })
            )
            server.listen();


            const form=screen.getByTestId("form-sign-up")

            act(()=>{
                userEvent.click(button)
            })

            // await waitFor(()=>{
            //     expect(form).not.toBeInTheDocument();
            // })
            await waitForElementToBeRemoved(form)
        })

        it.each`
            field          | message
            ${'username'}  |${'Username cannot be null'}
            ${'email'}     |${'E-mail cannot be null'}
            ${'password'}  |${'Password cannot be null'}

        `(`displays $message for $field`,async(testFields)=>{

            const {field,message}=testFields;

            setup()
            let requestBody;
            const server=setupServer(
                rest.post('/api/1.0/users',(req,res,ctx)=>{
                    requestBody=req.body
                    return res(ctx.status(400),
                    ctx.json({
                        validationErrors:{[field]:message}
                    }))
                })
            )
            server.listen();
            userEvent.click(button);
            const validationError=await screen.findByText(message)
            expect(validationError).toBeInTheDocument()


        })

        it('hides spinner and enables button after response received',async ()=>{

            setup()
            let requestBody;
            const server=setupServer(
                rest.post('/api/1.0/users',(req,res,ctx)=>{
                    requestBody=req.body
                    return res(ctx.status(400),
                    ctx.json({
                        validationErrors:{username:"Username cannot be null"}
                    }))
                })
            )
            server.listen();

            userEvent.click(button);

            await screen.findByText("Username cannot be null")
            expect(screen.queryByRole('status')).not.toBeInTheDocument()
            expect(button).toBeEnabled()


        })

        it('displays mismatch message for password repeat input',()=>{

            setup()
            let requestBody;
            const server=setupServer(
                rest.post('/api/1.0/users',(req,res,ctx)=>{
                    requestBody=req.body
                    return res(ctx.status(400),
                    ctx.json({
                        validationErrors:{username:"Username cannot be null"}
                    }))
                })
            )
            server.listen();

            userEvent.type(passwordInput,'P4ssword')
            userEvent.type(passwordRepeatInput,'AnotherP4ssword')

            const validationError=screen.queryByText('Password mismatch')
            expect(validationError).toBeInTheDocument()



        })

        it.each`
            field        |message                     |label
            ${'username'}|${'Username cannot be null'}|${'Username'}
            ${'email'}|${'E-mail cannot be null'}|${'Email'}
            ${'password'}|${'Password cannot be null'}|${'Password'}


        `
        (`clears validation error after $field field is updated`,async(testFields)=>{

            const {field,message,label}=testFields
            setup()
            let requestBody;
            const server=setupServer(
                rest.post('/api/1.0/users',(req,res,ctx)=>{
                    requestBody=req.body
                    return res(ctx.status(400),
                    ctx.json({
                        validationErrors:{[field]:message}
                    }))
                })
            )
            server.listen();

            userEvent.click(button)
            const validationError=await screen.findByText(message)
            expect(validationError).toBeInTheDocument()

            userEvent.type(screen.queryByLabelText(label),'user1-updated')
            expect(validationError).not.toBeInTheDocument()



        })

    })
})
