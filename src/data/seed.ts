import { Connection } from "typeorm";
import { Feedback } from "../entity/Feedback";
import { User } from "../entity/User";
import * as bcrypt from "bcrypt";
import dotenv from "dotenv";
import { userData } from "../data/userData";
import { productRequestData } from "../data/productRequestData";
import { Comment } from "../entity/Comment";

dotenv.config();

const seedUsers = async (connection: Connection) => {
  const userRepo = connection.getRepository(User);
  const password = String(process.env.SEED_DB_PASSWORD);
  const hashedPassword = await bcrypt.hash(password, 10);
  const users = userData;

  await Promise.all(
    users.map(async (user) => {
      const userSplit = user.name.split(" ");

      const newUser = {
        username: user.username,
        image: user.image,
        firstName: userSplit[0],
        lastName: userSplit[1],
        password: hashedPassword,
      };

      await userRepo.create(newUser).save();
    })
  );
};

const seedFeedback = async (connection: Connection) => {
  const feedbackRepo = connection.getRepository(Feedback);
  const userRepo = connection.getRepository(User);
  const commentRepo = connection.getRepository(Comment);

  const user = await userRepo.findOne({
    where: { username: "feedbackcreator" },
  });

  await Promise.all(
    productRequestData.data.map(async (feedback) => {
      const newFeedback = {
        title: feedback.title,
        category: feedback.category,
        description: feedback.description,
        upvotes: feedback.upvotes,
        status: feedback.status,
        user: user,
      };

      console.log(newFeedback);

      const createdFeedback = await feedbackRepo.create(newFeedback).save();

      if (feedback.comments !== undefined) {
        feedback.comments?.map(async (comment) => {
          const user = await User.findOne({
            where: { username: comment.user.username },
          });

          const newComment = {
            content: comment.content,
            user: user,
            feedback: createdFeedback,
          };

          await commentRepo.create(newComment).save();
        });
      }
    })
  );
};

export { seedUsers, seedFeedback };
