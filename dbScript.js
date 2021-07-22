let req = indexedDB.open('Camera', 1); 
let db;

req.addEventListener('success', (e)=>{
    db = req.result;
});

req.addEventListener('upgradeneeded', (e)=>{
    let accessToNotesDB = req.result;
    accessToNotesDB.createObjectStore('Gallery', {keyPath: "mID"});
   
});

req.addEventListener('error', (e)=>{
    console.log('Error in creation/opening');   //never give error in bad form give a simple understandable error
});

let home = document.querySelector('#home');
home.addEventListener('click', (e)=>{
    location.assign('/');
});

function addMedia(media, type)    //blob or dataurl, img or video
{
    if(!db)
    return;

    let obj = {mID: Date.now(), media, type};
    
    // obj = {
    //     mid: 323352, media: data-URL, type: "image"
    // }
    
    let tx = db.transaction('Gallery', "readwrite");
    let gallery = tx.objectStore('Gallery');
    gallery.add(obj);
}

function deleteMedia(id)
{
    if(!db)
    return;

    let tx = db.transaction('Gallery', "readwrite");
    let gallery = tx.objectStore('Gallery');

    // when we set id as an attru to delete btn it becomes a string but we have 
    // stored id as a number in db so we have to typecast.
    gallery.delete(Number(id));

}

function viewMedia()
{
    let tx = db.transaction("Gallery", "readonly");
    let gallery = tx.objectStore("Gallery");
    let cReq = gallery.openCursor();

    cReq.addEventListener('success', (e)=>{
        let cursor = cReq.result;
        
        if(cursor){
            // console.log(cursor.value);
            let mo = cursor.value;   //media object
            
            let div = document.createElement('div');
            div.classList.add('media-container');
            let linkForDownlaodBtn = "";
            if(mo.type == 'video'){
                let url = window.URL.createObjectURL(cursor.value.media);
                linkForDownlaodBtn = url;
                div.innerHTML =  ` 
                    <div class="media">
                        <video src="${url}" autoplay loop controls muted></video>
                    </div>
                    <button class="download">Download</button>
                    <button class="delete" data-id="${cursor.value.mID}">Delete</button>`  //data- is predefined after that u can write anything e.g. data-anything="some value"
                //render a video tag, src = blob obj, video tag

            }else{
                linkForDownlaodBtn = cursor.value.media;
                div.innerHTML =  ` 
                    <div class="media">
                        <img src="${cursor.value.media}" alt="Error">
                    </div>
                    <button class="download">Download</button>
                    <button class="delete" data-id="${cursor.value.mID}">Delete</button>`
                    //render a image tag, img tag, src = dataURL
                }

                let downloadBtn = div.querySelector('.download');
                downloadBtn.addEventListener("click", (e)=>{
                    let a = document.createElement('a');
                    a.href = linkForDownlaodBtn;
                    
                    if(mo.type == 'video')    a.download = 'video.mp4'
                    
                    else    a.download = 'img.png'
                    
                    a.click();
                    a.remove();
                });

                let body = document.querySelector('body');
                let deleteBtn = div.querySelector('.delete');
                deleteBtn.addEventListener('click', (e)=>{
                    //removing from db
                    let id = e.currentTarget.getAttribute('data-id');
                    deleteMedia(id);

                    //removing from ui
                    e.currentTarget.parentElement.remove();
                });
            body.append(div);
            cursor.continue();
        }
    });
}