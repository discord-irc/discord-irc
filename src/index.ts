import './style.css'

const foo: string = "hello world from ts"
console.log(foo)

const backendUrl = 'http://localhost:6969'

document.querySelector('form')
    .addEventListener('submit', (event) => {
        event.preventDefault()
        const messageInp: HTMLInputElement = document.querySelector('#message')
        const message = messageInp.value
        fetch(`${backendUrl}/ddnet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                msg: message
            })
        })
            .then(res => console.log(res))
    })