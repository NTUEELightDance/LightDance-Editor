-- CreateEnum
CREATE TYPE "PartType" AS ENUM ('LED', 'FIBER');

-- CreateTable
CREATE TABLE "Color" (
    "color" TEXT NOT NULL,
    "colorCode" TEXT NOT NULL,

    CONSTRAINT "Color_pkey" PRIMARY KEY ("color")
);

-- CreateTable
CREATE TABLE "LEDEffect" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "partName" TEXT NOT NULL,
    "repeat" INTEGER NOT NULL,
    "frames" JSONB[],

    CONSTRAINT "LEDEffect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditingPositionFrame" (
    "userId" INTEGER NOT NULL,
    "frameId" INTEGER,

    CONSTRAINT "EditingPositionFrame_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "EditingControlFrame" (
    "userId" INTEGER NOT NULL,
    "frameId" INTEGER,

    CONSTRAINT "EditingControlFrame_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Dancer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Dancer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Part" (
    "id" SERIAL NOT NULL,
    "dancerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PartType" NOT NULL,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PositionData" (
    "dancerId" INTEGER NOT NULL,
    "frameId" INTEGER NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "z" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PositionData_pkey" PRIMARY KEY ("dancerId","frameId")
);

-- CreateTable
CREATE TABLE "PositionFrame" (
    "id" SERIAL NOT NULL,
    "start" INTEGER NOT NULL,

    CONSTRAINT "PositionFrame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControlData" (
    "partId" INTEGER NOT NULL,
    "frameId" INTEGER NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "ControlData_pkey" PRIMARY KEY ("partId","frameId")
);

-- CreateTable
CREATE TABLE "ControlFrame" (
    "id" SERIAL NOT NULL,
    "start" INTEGER NOT NULL,
    "fade" BOOLEAN NOT NULL,

    CONSTRAINT "ControlFrame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EffectListData" (
    "id" SERIAL NOT NULL,
    "start" INTEGER NOT NULL,
    "end" INTEGER NOT NULL,
    "description" TEXT,
    "dancerData" JSONB[],
    "controlFrames" JSONB[],
    "positionFrames" JSONB[],

    CONSTRAINT "EffectListData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Logger" (
    "id" SERIAL NOT NULL,
    "user" TEXT NOT NULL,
    "variableValue" JSONB,
    "fieldName" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "errorMessage" JSONB,
    "result" JSONB,

    CONSTRAINT "Logger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LEDEffect_name_partName_key" ON "LEDEffect"("name", "partName");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EditingPositionFrame_frameId_key" ON "EditingPositionFrame"("frameId");

-- CreateIndex
CREATE UNIQUE INDEX "EditingControlFrame_frameId_key" ON "EditingControlFrame"("frameId");

-- CreateIndex
CREATE UNIQUE INDEX "PositionFrame_start_key" ON "PositionFrame"("start");

-- CreateIndex
CREATE UNIQUE INDEX "ControlFrame_start_key" ON "ControlFrame"("start");

-- AddForeignKey
ALTER TABLE "EditingPositionFrame" ADD CONSTRAINT "EditingPositionFrame_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditingPositionFrame" ADD CONSTRAINT "EditingPositionFrame_frameId_fkey" FOREIGN KEY ("frameId") REFERENCES "PositionFrame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditingControlFrame" ADD CONSTRAINT "EditingControlFrame_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditingControlFrame" ADD CONSTRAINT "EditingControlFrame_frameId_fkey" FOREIGN KEY ("frameId") REFERENCES "ControlFrame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part" ADD CONSTRAINT "Part_dancerId_fkey" FOREIGN KEY ("dancerId") REFERENCES "Dancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PositionData" ADD CONSTRAINT "PositionData_dancerId_fkey" FOREIGN KEY ("dancerId") REFERENCES "Dancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PositionData" ADD CONSTRAINT "PositionData_frameId_fkey" FOREIGN KEY ("frameId") REFERENCES "PositionFrame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlData" ADD CONSTRAINT "ControlData_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlData" ADD CONSTRAINT "ControlData_frameId_fkey" FOREIGN KEY ("frameId") REFERENCES "ControlFrame"("id") ON DELETE CASCADE ON UPDATE CASCADE;
