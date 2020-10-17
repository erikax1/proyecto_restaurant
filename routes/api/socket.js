const User=require('../../database/collection/user');
const Producto=require('../../database/collection/producto');
const empty=require('is-empty');

module.exports=(io)=>{
    io.socket.on('connection',(socket)=>{
        socket.on('chat',(data)=>{
            let resp={
                name:data.name,
                message:data.message
            }
            io.socket.emit('chat',resp);
            save(data);
        });
    });
}

function save(data){
    let idPr=data.idPr;
    let idUs=data.idUs;
    let name=data.name;
    let message=data.message;
    Producto.findOne({_id:idPr}).select('chat title creator').exec(async(err,doc)=>{
        try{
            let idChat=data.idChat;
            let index=doc.chat.findOne(dat=>{return dat._id==idChat});
            let user=await User.findOne({_id:(idUs==doc.creator?doc.chat[index].idUser:doc.creator)}).select('notify name');
            doc.chat[index].messages.push({
                name,
                message
            });
            let index2=user.notify.findIndex(dat=>{return dat.idChat=idChat});
            if(index2==-1){
                user.notify.push({
                     titulo:doc.title,
                     idProd:idPr,
                     idChat:idChat,
                     fecha:new Date()
                });
            }else{
                user.notify[index2].fecha=new Date();
            }
            User.findByIdAndUpdate(user._id,user,()=>{
                console.log('usuario notificado');
            });
        }catch (e){
            let index=doc.chat.findIndex(dat=>{return dat.idUser==idUs});
            let user=await User.findOne({_id:doc.creator}).select('notify name');
            let idChat;
            if (index==-1){
                doc.chat.push({
                    idUser:idUs,
                    messages:[{
                        name,
                        message
                    }]
                });
                idChat=doc.chat[doc.chat.length-1]._id;
            }else{
                doc.chat[index].messages.push({
                    name,
                    message
                });
                idChat=doc.chat[index]._id;
            }
            let index2=user.notify.findIndex(dat=>{return dat.idChat==idChat});
            if(index2==-1){
                user.notify.push({
                    titulo:doc.title,
                    idProd:idPr,
                    idChat:idChat,
                    fecha:new Date()
               });
            }else{
                user.notify[index2].fecha=new Date();
            }
            user.findByIdAndUpdate(user._id,user,()=>{
                console.log('user notify');
            });
        }
        Producto.findByIdAndUpdate(doc._id,doc,()=>{
            console.log('mensaje insertado');
        });
    });
}