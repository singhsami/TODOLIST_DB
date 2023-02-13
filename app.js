const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app=express();


app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"));
mongoose.set('strictQuery', true)
mongoose.connect('mongodb://127.0.0.1/ToDodb',{useNewUrlParser:true})

const itemsSchema={
  name:String
}
 

const Item = mongoose.model("Item", itemsSchema);

const item1=new Item({
  name:"Welcome to your todolist1"
})
const item2=new Item({
  name:"Welcome to your todolist2"
})
const item3=new Item({
  name:"Welcome to your todolist3"
})

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
}
const List=mongoose.model("List",listSchema)


app.get('/',(req,res)=>{

  Item.find({},(err,results)=>{
if(results.length===0){

  Item.insertMany(defaultItems,(err)=>{
    if(err){
      console.log(err)
    } else{
      console.log("success")
    }
    })
    res.redirect("/")
    
} else {
      res.render("list",{listTitle:"Today",newListItems: results})}
  })
});

app.get("/:customListName",(req,res)=>{
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        //create a new list
        const list=new List({
          name:customListName, 
          items:defaultItems
        })
        list.save();
        res.redirect("/" + customListName); 
    }else{
      //show an existing
     
      res.render("list",{listTitle:foundList.name,newListItems:foundList.items})
    }
  }
      
})
})
app.post('/',(req,res)=>{
const itemName=req.body.newItem
const listName=req.body.list

const item=new Item({
  name:itemName
})

if(listName === "Today"){
  item.save();
  res.redirect("/")
}else{
  List.findOne({name:listName},(err,foundList)=>{
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" +listName);
  })
}

})

app.post("/delete",(req,res)=>{
 const checkboxId=req.body.checkbox
 const listName=req.body.listName;

 if(listName === "Today"){
  Item.findByIdAndRemove(checkboxId,(err)=>{
  if(!err){
    res.redirect("/")
    } 
   })}
else{
List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkboxId}}},(err,foundList)=>{
  if(!err){
    res.redirect("/" + listName)
  }
})
}
})
app.get("/work",(req,res)=>{
  res.render("list",{listTitle: "Worklist",newListItems:workItems})
})

app.listen(3000,(req,res)=>{
    console.log("Server is running on port 3000");
})

