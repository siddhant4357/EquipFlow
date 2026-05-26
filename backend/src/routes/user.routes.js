const express = require('express');
const { getUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/user.controller');
const { protect, allowRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect, allowRoles('admin'));

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
