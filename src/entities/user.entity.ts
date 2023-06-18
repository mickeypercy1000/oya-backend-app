import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from "bcrypt"
import { Exclude } from 'class-transformer';

@Entity("users")
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: false, nullable: false })
    name: string;

    @Column({ unique: true, nullable: false })
    email: string;

    @Column({ unique: false, nullable: true })
    birthdate: string;

    @Column({ select: false, nullable: false })
    @Exclude()
    password: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created_at: string;

    @BeforeInsert()
    async hashPassword(){
        this.password = await bcrypt.hash(this.password, 10)
    }
}