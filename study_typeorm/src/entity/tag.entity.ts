import { Entity, ManyToMany, PrimaryColumn } from 'typeorm';
import { PostModel } from './post.entity';

@Entity()
export class TagModel {
  @PrimaryColumn({ unique: true, nullable: false })
  name: string;

  @ManyToMany(() => PostModel, (post) => post.tags)
  posts: PostModel[];
}