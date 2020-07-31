var express=require("express");
var bodyParser=require("body-parser");
var app=express();
var ejs=require("ejs");
var date=require(__dirname+"/date.js");
var mongoose=require("mongoose");
var _=require("lodash");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');

let day=date.getDate();
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser: true, useUnifiedTopology: true});

const  itemSchema=new mongoose.Schema({
  name:String
});

const Item =mongoose.model("Item",itemSchema);

var item1=new Item({
  name:"Welcome to the to do list"
});
var item2=new Item({
  name:"Hit the + button to add a new line"
});

var item3=new Item({
  name:"<-- Hit this to delete an item"
});

var defaultItem=[item1,item2,item3];

const  listSchema=new mongoose.Schema({
  name:String,
  items:[itemSchema]
});


const List=mongoose.model("List",listSchema);

app.get("/",function(req,res){

  Item.find({},function(err,items){
    if(items.length===0){
      Item.insertMany(defaultItem,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Success");
        }
      });
      res.redirect("/");
    }else{
      res.render("list",{listTitle: day, newListItems: items});
    }
  });
});

app.post("/",function(req,res){

const itemName=req.body.newItem;
const listName=req.body.list;
const item =new Item({
  name:itemName
});
if(listName===day){
  item.save();
  res.redirect("/");
}else{

  List.findOneAndUpdate({name:listName},{$push:{items:item}},function(err,foundList){
  // List.findOne({name:listName},function(err,foundList){
  //   foundList.items.push(item);
  //   foundList.save();
    res.redirect("/"+listName);
  });
}
});

app.post("/delete",function(req,res){
  const checkedItemId= req.body.checkbox;
  const listName=req.body.listName;
  if(listName===day){
  Item.deleteOne({_id:checkedItemId},function(err){
    if(err){
      console.log(err);
    }else{
      console.log("successfully deleted");
      res.redirect("/");
    }
  });
}else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
    if(!err){
      console.log("successfully deleted");
      res.redirect("/"+listName);
    }
  });
}
});

app.get("/:customListName",function(req,res){
const customListName=_.capitalize(req.params.customListName);
List.findOne({name:customListName},function(err,foundList){
  if(!err){
    if(!foundList){
      const list=new List({
        name:customListName,
        items:[]
      });
      list.save();
      res.redirect("/"+customListName);
    }else{
      res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
    }
  }

});
});

//
// app.get("/work",function(req,res){
//    res.render("list",{listTitle: "Work List", newListItems: workItems})
// });
//
// app.post("/work",function(req,res){
//   let item=req.body.newItem;
//   workItems.push(item);
//   res.redirect("/work");
// });


app.get("/about",function(req,res){
  res.render("about");
});

app.listen(2998,function(){
  console.log("Server is running on port 2998");
});
