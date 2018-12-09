import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {UserSchema} from "../models";

const JWT_KEY = 'kappa';

export default {
  Query: {
    getAllUsers: async (_source, _args) => {
      return await UserSchema.find({})
          .skip(_args.skip)
          .limit(_args.limit)
          .exec()
          .then()
          .catch(err => {
            console.error('Get all users error!' + err)
          })
    },
    getTotalNumberUsers: async (_source, _args) => {
      return await UserSchema.count({}, (err, result) => {
        if (err) console.error('Getting total number of users error', err);
        return result
      })
    }
  },
  Mutation: {
    login: async (_source, _args) => {
      let token;
      await UserSchema.findOne({email: _args.email})
          .exec()
          .then(async user => {
            await bcrypt.compare(_args.password, user.password)
                .then(res => {
                  if (res) {
                    token = jwt.sign({
                          id: user._id,
                          email: user.email,
                          server: user.server,
                          languages: user.languages,
                          summoner: user.summoner
                        },
                        JWT_KEY, {
                          expiresIn: "1h"
                        });
                  } else {
                    console.error('Password invalid');
                  }
                })
          })
          .catch(err => {
            console.error('Password invalid', err)
          });
      return token
    },
    signup: async (_source, _args) => {
      let done = false;
      await UserSchema.find({
        $or: [
          {email: _args.email},
          {$and: [{summoner: _args.summoner}, {server: _args.server}]}
        ]
      }, (err, user) => {
        if (user.length === 1) {
          console.log('User already exists!')
        } else {
          done = true;
          bcrypt.hash(_args.password, 10, (err, hash) => {
            if (err) {
              console.error('Auth error')
            } else {
              const user = new UserSchema({
                email: _args.email,
                password: hash,
                server: _args.server,
                summoner: _args.summoner,
                languages: _args.languages
              });
              user.save()
                  .then(result => {
                    console.log('User created!')
                  })
                  .catch(err => {
                    console.error('User has not created!')
                  })
            }
            if (err) console.error("User creation error")
          })
          console.log('USER', user)
        }
      });
      console.log('DONE', done)
      return done
    },
    updateUserInfo: async (_source, _args) => {
      let oldData = jwt.decode(_args.token);
      let done = false;

      await bcrypt.hash(_args.password, 10)
          .then(hash => {
            done = true;
            UserSchema.findOneAndUpdate({email: oldData.email}, {
              email: _args.email,
              password: hash,
              languages: _args.languages
            }, (err, user) => {
              if (err) console.error('Updating user error');
              if (user) {
                console.log('Updating user complete');
              }
            });
          })
          .catch(err => {
            console.error('Update user info error', err)
          });
      return done
    },
    deleteUserInfo: async (_source, _args) => {
      let oldData = jwt.decode(_args.token);
      let done = false;

      await UserSchema.findOneAndDelete({_id: oldData.id})
          .exec()
          .then(user => {
            if (user) {
              console.log('User deleted!');
              done = true;
            }
          })
          .catch(err => {
            console.error('User has not deleted!', err);
          });
      return done
    }
  }
}