const router=require('express').Router();
const customerController=require('../controllers/customercontroller');
const auth=require('../middleware/auth');

router.post('/',auth,customerController.createCustomer);
router.get('/',auth,customerController.getCustomers);
router.get('/:id',auth,customerController.getCustomerById);
router.put('/:id',auth,customerController.updateCustomer);
router.delete('/:id',auth,customerController.deleteCustomer);
router.get('/:id/loans',auth,customerController.getCustomerLoans);
router.get('/:id/stats',auth,customerController.getCustomerStats);

module.exports=router;