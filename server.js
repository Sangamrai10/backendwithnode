import http from 'http';
const http = http()
const port = process.env.PORT || 3000;

const server = http.createServer((req, res)=>{
 res.setHeader('content-type', 'text/html')
 res.send('<h1>welcome to the server</h1>')
 res.send('<p>hello</p>')
})
server.listen(port,()=>{
    console.log('server listening at http://localhost:3000')
})
