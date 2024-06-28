const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const lodash=require("lodash")

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

app.set('view engine', 'ejs')

mongoose.connect('mongodb://localhost:27017/todolistDB')

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'You forgot to give your entry a name.']
  }
})

const Item = mongoose.model('Item', itemSchema)

const item1 = new Item({
  name: 'welcome to your to-do list'
})

const item2 = new Item({
  name: 'Click + to add an item'
})

const item3 = new Item({
  name: '<-- hit this to delete any item'
})

const defaultItems = [item1, item2, item3]

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
})

const List = mongoose.model('List', listSchema)

app.get('/', (req, res) => {
  // var today = new Date();
  // var currentDay = today.getDay();
  // var day = "";

  // switch(currentDay){
  //     case 0: day="Sunday";break;
  //     case 1: day="Monday";break;
  //     case 2: day="Tuesday";break;
  //     case 3: day="Wednesday";break;
  //     case 4: day="Thursday";break;
  //     case 5: day="Friday";break;
  //     case 6: day="Saturday";break;
  // }
  // options = {
  //     weekday: "long",
  //     day: "numeric",
  //     month: "long"
  // }
  // day = today.toLocaleDateString("hi-IN", options)

  Item.find({})
    .then(founditems => {
      if (founditems.length === 0) {
        Item.insertMany(defaultItems)
          .then(() => {
            console.log('Default Items saved Successfully.')
          })
          .catch(err => {
            console.log(err)
          })
        res.redirect('/')
      } else {
        res.render('list', { listTitle: 'Today', pusheditems: founditems })
      }
    })
    .catch(err => {
      console.log(err)
    })
})

app.post('/', (req, res) => {
  const item_input = new Item({
    name: req.body.item
  })
  const listName = req.body.button

  if (listName === 'Today') {
    Item.create(item_input)
      .then(() => {
        console.log('Items added to DB')
      })
      .catch(err => {
        console.log(err)
      })
    res.redirect('/')
  } else {
    List.findOne({ name: listName }).then(foundlist => {
      foundlist.items.push(item_input)
      foundlist.save()
      res.redirect(`/${listName}`)
    })
  }
})

app.post('/delete', (req, res) => {
  const delItemId = req.body.marked
  const listName = req.body.listName

  if (listName === 'Today') {
    Item.findByIdAndDelete(delItemId)
      .then(task => {
        console.log(task)
      })
      .catch(err => {
        console.log(err)
      })
    res.redirect('/')
  }else{
      List.findOne({ name: listName }).then((foundlist) => {
        foundlist.items.pull({_id:delItemId})
        foundlist.save()
        res.redirect(`/${listName}`)
      })

  }

})

app.get('/:listName', (req, res) => {
  reqListName = lodash.capitalize(req.params.listName)
  List.findOne({ name: reqListName })
    .then((foundlist) => {
      if (!foundlist) {
        // console.log('doesnt exisst')
        const list = new List({
          name: reqListName,
          items: defaultItems
        })
        List.create(list).then(()=>{
            res.redirect(`/${reqListName}`)
        }).catch((err)=>{
            console.log(err)
        })
        
      } else {
        // console.log('it does exists')
        res.render('list', {
          listTitle: foundlist.name,
          pusheditems: foundlist.items
        })
      }
    })
    .catch(err => {
      console.log(err)
    })
})

// app.get("/Work", (req, res) => {
//     res.render("list", { listTitle: "Work List", pusheditems: work_items })
// })

// app.post("/Work", (req, res) => {
//     work_item = req.body.item;
//     work_items.push(work_item)
//     res.redirect("/Work")
// })

app.listen(3000, () => {
  console.log('Server running on port 3000.')
})
