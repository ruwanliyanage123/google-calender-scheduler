const express = require('express');
const router = express.Router();

router.get('/', (request, response)=>{
    response.json({message: 'the get method'});
});

module.exports = router;