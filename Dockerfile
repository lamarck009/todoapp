FROM node:20-alpine AS builder

# pnpm 설치
RUN npm install -g pnpm

WORKDIR /app

# package.json 먼저 복사
COPY package.json pnpm-lock.yaml ./

# pnpm으로 의존성 설치
RUN pnpm install --frozen-lockfile

# 나머지 파일들 복사
COPY . .

# 빌드
RUN pnpm run build

FROM node:20-alpine AS runner
WORKDIR /app

# 프로덕션 환경 설정
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# 필요한 파일들만 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 권한 설정
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]