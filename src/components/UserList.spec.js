import {render,screen} from '../test/setup'
import UserList from './UserList';
import {setupServer} from 'msw/node';
import {rest} from "msw"
import userEvent from '@testing-library/user-event';
import storage from '../state/storage';

const users=[
          {
            id: 1,
            username: 'user1',
            email: 'user1@mail.com',
            image: null
          },
          {
            id: 2,
            username: "user2",
            email: "user2@mail.com",
            image: null
          },
          {
            id: 3,
            username: "user3",
            email: "user3@mail.com",
            image: null
          },
          {
            id: 4,
            username: 'user4',
            email: 'user1@mail.com',
            image: null
          },
          {
            id: 5,
            username: "user5",
            email: "user5@mail.com",
            image: null
          },
          {
            id: 6,
            username: "user6",
            email: "user6@mail.com",
            image: null
          },
          {
            id: 7,
            username: 'user7',
            email: 'user7@mail.com',
            image: null
          }
        ]

const getPage=(page,size)=>{

    let start=page*size
    let end=start+size
    let totalPages=Math.ceil(users.length/size)
    console.log(users)

    return (
    
        {content:users.slice(start,end),
        page,
        size,
        totalPages
    })
}

let header;
const server=setupServer(
    rest.get('/api/1.0/users',(req,res,ctx)=>{
        header=req.headers.get("Authorization")
        let page=+req.url.searchParams.get('page')
        let size=+req.url.searchParams.get('size')
       
        if (Number.isNaN(page)) page=0;
        if(Number.isNaN(size)) size=5;
        return res(ctx.status(200),ctx.json(getPage(page,size)))
    })
);

const setup=()=>{
    render(<UserList/>)
}

beforeEach(()=>{
    server.resetHandlers()
});

afterEach(()=>{
    storage.clear()
});

beforeAll(()=>server.listen())

afterAll(()=>server.close())

describe('User List',()=>{

    describe('Interactions',()=>{


        it('displays three users in list',async ()=>{

            setup();
            const users=await screen.findAllByText(/user/)
            expect(users.length).toBe(3);
        })
    
        it('displays next page link',async()=>{
    
            setup();
            await screen.findByText('user1')
            expect(screen.queryByText('next >')).toBeInTheDocument()
    
        })
    
        it('displays next page after clicking next',async()=>{
            setup()
            await screen.findByText('user1')
            const nexPageLink=screen.queryByText('next >')
            userEvent.click(nexPageLink)
            const firstUserOnPageTwo=await screen.findByText('user4')
            expect(firstUserOnPageTwo).toBeInTheDocument()
    
        })
    
        it('hides next page link at last page',async()=>{
            setup();
            await screen.findByText('user1')
            const nextPageLink=screen.queryByText('next >')
            userEvent.click(nextPageLink)
            await screen.findByText('user4')
            userEvent.click(screen.queryByText('next >'))
            screen.debug()
            await screen.findByText('user7')
            screen.debug()

            expect(nextPageLink).not.toBeInTheDocument()
        })
    
        it('does not display the previous page link in the first page',async ()=>{
    
            setup();
            await screen.findByText('user1')
            expect(screen.queryByText('< previous')).not.toBeInTheDocument()
        })
    
        it('displays the previous page link in the second page',async()=>{
            
            setup();
            await screen.findByText('user1')
            const nextPageLink=screen.queryByText('next >')
            userEvent.click(nextPageLink)
            await screen.findByText('user4')
            expect(screen.queryByText('< previous')).toBeInTheDocument()
        })
    
        it('displays the previous page after clicking previous page link',async()=>{
            
            setup();
            const user1=await screen.findByText('user1')
            const nextPageLink=screen.queryByText('next >')
            userEvent.click(nextPageLink)
            await screen.findByText('user4')
            const previousPageLink=screen.queryByText('< previous')
            userEvent.click(previousPageLink)
            await screen.findByText('user1')
            expect(screen.queryByText('user1')).toBeInTheDocument()
        })

        it('displays spinner during the api call is in progress',async()=>{

            setup();
            const spinner=screen.getByRole('status',{hidden:true})
            await screen.findByText('user1')
            expect(spinner).not.toBeInTheDocument()

        })

        it("sends request with authorization header",async ()=>{
            storage.setItem("auth",{id:5,username:"user5",header:"auth header value"})
            setup()
            await screen.findByText("user1")
            expect(header).toBe("auth header value")

        })
    
    })
    
})