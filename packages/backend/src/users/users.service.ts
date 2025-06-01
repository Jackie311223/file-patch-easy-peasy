import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// Import Role enum và User type từ Prisma Client đã được generate
// Lỗi "Module ... has no exported member 'Role'" sẽ không còn nếu schema.prisma có enum Role và prisma generate đã chạy
import { Prisma, Role, User } from '@prisma/client'; 
import * as bcrypt from 'bcrypt';

// Định nghĩa một DTO (Data Transfer Object) hoặc Interface cho dữ liệu tạo user từ controller
// Điều này giúp type-safety tốt hơn cho dữ liệu đầu vào từ request.
export interface CreateUserDto {
  email: string;
  password: string; 
  name?: string;
  roles?: string[]; // Roles dạng string từ input (ví dụ: từ client request)
  tenantId?: string; 
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { roles: roleStrings, password: plainPassword, ...restOfUserData } = createUserDto;
    
    // 1. Hash password trước khi lưu vào database
    const saltRounds = 10; // Hoặc lấy từ config
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    // 2. Chuyển đổi và xác thực roles từ string[] thành Role[]
    let validatedRolesEnum: Role[] | undefined = undefined;
    if (roleStrings && Array.isArray(roleStrings)) {
      validatedRolesEnum = roleStrings
        .map(roleStr => {
          // Chuyển đổi string thành enum key (ví dụ: 'super_admin' hoặc 'SUPER_ADMIN' -> Role.SUPER_ADMIN)
          const enumKey = roleStr.toUpperCase() as keyof typeof Role; // Ép kiểu key thành key của enum Role
          if (Role[enumKey] !== undefined) { // Kiểm tra xem string có phải là một giá trị hợp lệ trong enum Role không
            return Role[enumKey]; // Sử dụng giá trị enum thực tế
          }
          // Nếu role string không hợp lệ, có thể bỏ qua hoặc báo lỗi tùy logic
          console.warn(`Invalid role string provided: '${roleStr}'. It will be ignored.`);
          return null;
        })
        .filter(role => role !== null) as Role[]; // Loại bỏ các giá trị null và ép kiểu thành Role[]
      
      // Nếu sau khi filter không còn role nào hợp lệ (nhưng đầu vào có roles), có thể xử lý thêm
      if (validatedRolesEnum.length === 0 && roleStrings.length > 0) {
        // throw new BadRequestException('No valid roles provided or all provided roles are invalid.');
        validatedRolesEnum = undefined; // Hoặc gán một role mặc định nếu logic ứng dụng yêu cầu
      }
    }

    // 3. Chuẩn bị data cho Prisma create
    // Prisma.UserCreateInput mong đợi 'roles' là 'Role[]' hoặc 'UserCreaterolesInput' (ví dụ: { set: Role[] })
    const dataForPrisma: Prisma.UserCreateInput = {
      ...restOfUserData, // Bao gồm email, name (nếu có), tenantId (nếu có)
      password: hashedPassword,
      // Chỉ thêm 'roles' vào data nếu validatedRolesEnum có giá trị và không rỗng
      ...(validatedRolesEnum && validatedRolesEnum.length > 0 && { roles: { set: validatedRolesEnum } }),
    };
    
    try {
      return await this.prisma.user.create({ 
        data: dataForPrisma 
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // Lỗi unique constraint (ví dụ: email đã tồn tại)
        if (e.code === 'P2002') {
          throw new BadRequestException(`User with email '${createUserDto.email}' already exists.`);
        }
      }
      throw e; // Ném lại các lỗi khác
    }
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
  
  async findOneById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
  // Thêm các phương thức khác nếu cần (update, delete, etc.)
}