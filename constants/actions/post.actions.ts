"use server";
import Post from "@/lib/models/post.model";
import User from "@/lib/models/user.model";
import { connectDB } from "@/lib/mongoose";
import { revalidatePath } from "next/cache";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createPost({ text, author, communityId, path }: Params) {
  // console.log("author", author.toString(), text)
  try {
    connectDB();
    const createdPost = await Post.create({
      text,
      author,
      community: null,
    });
    // const val = await createdPost.populate("author")
    // console.log("createdPost", val)
    await User.findByIdAndUpdate(author, {
      $push: {
        posts: createdPost._id,
      },
      new: true,
      // upsert: true,
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error creating post: ${error.message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  try {
    connectDB();
    //calculate the number of post to skip depending on the current pagenumber
    const skipPosts = (pageNumber - 1) * pageSize;

    //Posts having no parent, i.e, the main post or the top level post
    const postQuery = Post.find({
      parentId: { $in: [null, undefined] },
    })
      .sort({ createdAt: "desc" })
      .skip(skipPosts)
      .limit(pageSize)
      .populate({
        path: "author",
        model: User,
      })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id name parentId image",
        },
      });

    const totalPostsCount = await Post.countDocuments({
      parentId: { $in: [null, undefined] },
    });

    const posts = await postQuery.exec();

    const isNext = totalPostsCount > skipPosts + posts.length;

    return { posts, isNext };
  } catch (error: any) {
    throw new Error(`Error while fetching Posts: ${error?.message}`);
  }
}

export async function fetchPostById(id: string) {
  try {
    connectDB();

    //populate community also
    const post = await Post.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        model: Post,
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: Post,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();

    return post;
  } catch (error: any) {
    throw new Error(`Error while fetching Post: ${error.message}`);
  }
}

export async function addCommentToPost(
  postId: string,
  commentText: string,
  userId: string,
  path: string
) {
  try {
    connectDB();

    const originalPost = await Post.findById(postId);
    if (!originalPost) {
      throw new Error(`Post not found`);
    }

    const commentPost = new Post({
      text: commentText,
      author: userId,
      parentId: postId,
    });

    const savedCommentPost = await commentPost.save();

    originalPost.children.push(savedCommentPost._id);

    await originalPost.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error adding comment to post: ${error.message}`);
  }
}

export async function fetchUserPosts(userId: string) {
  try {
    connectDB();
    const posts = User.findOne({ id: userId }).populate({
      path: "posts",
      model: Post,
      populate: {
        path: "children",
        model: Post,
        populate: {
          path: "author",
          model: User,
          select: "name image id",
        },
      },
    });

    return posts;
  } catch (error: any) {
    throw new Error(`Error fetching User Posts: ${error.message}`);
  }
}
