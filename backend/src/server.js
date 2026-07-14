const express=require('express');
const cors=require('cors');
const helmet=require('helmet');
const rateLimit=require('express-rate-limit');
require('dotenv').config();

const apiRoutes=require('./routes/apiRoutes');

const app=express();

app.use(helmet());

app.use(cors({
origin:true,
credentials:true
}));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

const limiter=rateLimit({
windowMs:15*60*1000,
max:100,
standardHeaders:true,
legacyHeaders:false
});

app.use('/api',limiter);

app.get('/',(req,res)=>{
res.json({
success:true,
message:'Loan Management API Running'
});
});

app.use('/api',apiRoutes);

app.use((err,req,res,next)=>{
console.error(err);
res.status(err.status||500).json({
success:false,
message:err.message||'Internal Server Error'
});
});

app.use((req,res)=>{
res.status(404).json({
success:false,
message:'Route Not Found'
});
});

const PORT=process.env.PORT||4000;

app.listen(PORT,()=>{
console.log(`Server running on port ${PORT}`);
});