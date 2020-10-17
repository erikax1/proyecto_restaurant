const Producto=require('../../database/collection/producto');
const express=require('express');
const router=express.Router();
const empty=require('is-empty');


router.get('/',(req,res)=>{
    Producto.find({},(err,docs)=>{
        if(empty(docs)){
            res.json({message:'no hay productos'});
        }else{
            res.json(docs);
        }
    });
});

const multer=require('multer');
const path=require('path');
const fs=require('fs');
//const { url } = require('inspector');

const storage=multer.diskStorage({
    destination:function (res,file,cb) {
        try{
            fs.statSync('./public/uploads');
        }catch (e) {
            fs.mkdirSync('./public/uploads/');
        }
        cb(null,'./public/uploads/');
    },
    filename:(res,file,cb)=>{
        cb(null,'IMG'+Date.now() + path.extname(file.originalname));
    }
});
const upload=multer({ storage: storage });

router.post('/producto',upload.array('img', 12),async(req,res)=>{
    console.log(req.body);
    let imgSet=[];
    if(!empty(req.files)){
        req.files.forEach(dat=>{
            imgSet.push({
                url:'uploads/'+dat.filename
            });
        });
    }
    req.body.urls=imgSet;
    let ins=new Producto(req.body);
    let result=await ins.save();
    if(empty(result)){
        res.json({message:'existio un error'});
    }else{
        res.json({message:'succes'});
    }
});
//una consulta al servido
/*router.get('/vistaHome',(req,res)=>{
    Producto.find().select('_id title price urls creator').exec((err,docs)=>{
        let arr=[];
        docs.forEach(dat=>{
            arr.push({
                _id:dat._id,
                title:dat.title,
                price:dat.price+' ',
                url:dat.urls[0].url,
                creator:dat.creator
            });
        });
        //console.log(arr);
        res.json(arr);
    });
});*/

router.get('detalle/:id',(req,res)=>{
    let id=req.params.id;
    Producto.findOne({_id:id}).select('title price urls description').exec((err,doc)=>{
        if(!empty(doc)){
            console.log(doc);
            res.json({
                message:'succes',
                title:doc.title,
                price:doc.price+'',
                description:doc.description,
                urls:doc.urls
            });
        }else{
            res.json({message:'no existe el id'});
        }
    });
});
module.exports=router;