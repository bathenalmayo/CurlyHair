const mongoose = require('mongoose');
const HairProduct = require('../models/hairProduct');
const products = require('./seedProduct');


mongoose.connect('mongodb://localhost:27017/curlyHair', {
    useNewUrlParser: true,
    useCreateIndex:true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});

/* SINGLE HAIR PRODUCT
const seedDB = async () =>{
    await HairProduct.deleteMany({});
    const cantu =  new HairProduct({
        name: 'Cantu Custard',
        image:'./hair product img/cantu_custard.jpg'
    });
    await cantu.save();
}
seedDB();
*/
const seedDB = async () => {
    await HairProduct.deleteMany({});
    for (let i = 0; i < 12; i++) {
        const price = Math.floor(Math.random()* 20) + 10;
        const stock = Math.floor(Math.random()* 30) + 5;
        const product = new HairProduct({
            name: `${products[i].productName}`,  
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi, cum nostrum? Eaque rem dignissimos id sunt nobis nulla possimus iure culpa tempore itaque. Qui, natus explicabo earum officia at magnam.",
            price,
            imageUrl: `${products[i].url}`,
            qty: 1,
            stock,
            buyer:'60b4f6f49dd0cf291c8a49ad' // id of "dog" user
        })
        await product.save();
    }
}


seedDB().then(()=>{
    mongoose.connection.close();
})