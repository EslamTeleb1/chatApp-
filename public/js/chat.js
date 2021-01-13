
const socket =io()

//elements 

const messageFormInput=document.getElementById('msg')
const messageFormButton =document.getElementById('snd')
const locationButon=document.querySelector('#location')
const messages=document.querySelector('#messages')


//tempaltes

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options

const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

//console.log(username,room)

// auto scroll

const autoscroll = () => {
    // New message element
      const $messages = messages
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('newClient',()=>{

    console.log('welcome')

       // document.getElementById('wlcm').textContent="Welcome"
  
})

socket.on('nwMsg',(msg)=>{
   // console.log(msg)
    const html =Mustache.render(messageTemplate,{
        username:msg.username,
        msg:msg.text,
        createdAt:moment(msg.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMsg',(location)=>{

//console.log(location)
const html =Mustache.render(locationTemplate,{
    username:location.username,
    location:location.url,
    locationCreatedAT:moment(location.createdAt).format('h:mm a')
})
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

 messageFormButton.addEventListener("click",(e)=>{

    e.preventDefault()

    messageFormButton.setAttribute('disabled','disabled')

    const msg =messageFormInput.value

    messageFormInput.value=''

    socket.emit('sndMsg' , msg , (error)=>{
   
        messageFormButton.removeAttribute('disabled')

        messageFormInput.focus()

     if(error)

       return  console.log(error)

      // console.log('message delivered !!!')
    })

})

locationButon.addEventListener('click',()=>{

    if(!navigator.geolocation)
    {
        console.log('geolocation is not suppored by your browser')
    }
    navigator.geolocation.getCurrentPosition((postion)=>{

        //console.log(postion.coords)
         const lat =postion.coords.latitude
         const long=postion.coords.longitude
         
         locationButon.setAttribute('disabled','disabled')

         socket.emit('sendLocation',{lat,long},()=>{

            locationButon.removeAttribute('disabled')

            console.log(' the location has been shared :)')

         })
    })
})

// socket.on('countUpdate',(count)=>{

//     console.log('the count has beet updated !!! ',count)
// })

socket.emit('join',{username,room},(error)=>{

    if(error)
    {
        alert(error)
        location.href='/'
    }
});

socket.on('roomData',({room,users})=>{

    const html=Mustache.render(sideBarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
   // console.log(room)
    //console.log(users)
})