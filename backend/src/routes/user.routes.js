const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { ATTENDANCE_STATUS, USER_ROLES } = require('../utils/constants');

const router = express.Router();

router.use(authMiddleware);

router.get('/staff', userController.listStaff);
router.post(
  '/staff',
  validate({
    name: { required: true, type: 'string' },
    role: { required: true, type: 'string' },
    status: { required: false, type: 'string' }
  }),
  userController.createStaff
);
router.put(
  '/staff/:id',
  validate({
    name: { required: false, type: 'string' },
    role: { required: false, type: 'string' },
    status: { required: false, type: 'string' }
  }),
  userController.updateStaff
);
router.delete('/staff/:id', userController.deleteStaff);
router.get('/attendance', userController.listAttendance);
router.post(
  '/attendance',
  validate({
    staffId: { required: true, type: 'string' },
    date: { required: true, type: 'string' },
    status: { required: true, enum: ATTENDANCE_STATUS }
  }),
  userController.markAttendance
);
router.get('/', userController.listUsers);
router.get('/:id', userController.getUserById);
router.post(
  '/',
  validate({
    name: { required: true, type: 'string' },
    email: { required: true, type: 'string' },
    password: { required: true, type: 'string' },
    role: { required: true, enum: USER_ROLES }
  }),
  userController.createUser
);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;


router.use(authMiddleware);

router.get('/staff', userController.listStaff);
router.post(
  '/staff',
  validate({
    name: { required: true, type: 'string' },
    role: { required: true, type: 'string' },
    status: { required: false, type: 'string' }
  }),
  userController.createStaff
);
router.put(
  '/staff/:id',
  validate({
    name: { required: false, type: 'string' },
    role: { required: false, type: 'string' },
    status: { required: false, type: 'string' }
  }),
  userController.updateStaff
);
router.delete('/staff/:id', userController.deleteStaff);
router.get('/attendance', userController.listAttendance);
router.post(
  '/attendance',
  validate({
    staffId: { required: true, type: 'string' },
    date: { required: true, type: 'string' },
    status: { required: true, enum: ATTENDANCE_STATUS }
  }),
  userController.markAttendance
);
router.get('/', userController.listUsers);
router.get('/:id', userController.getUserById);
router.post(
  '/',
  validate({
    name: { required: true, type: 'string' },
    email: { required: true, type: 'string' },
    password: { required: true, type: 'string' },
    role: { required: true, enum: USER_ROLES }
  }),
  userController.createUser
);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;