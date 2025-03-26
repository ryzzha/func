import { toNano } from '@ton/core';
import { LessonOne } from '../wrappers/LessonOne';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const lessonOne = provider.open(LessonOne.createFromConfig({}, await compile('LessonOne')));

    await lessonOne.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(lessonOne.address);

    // run methods on `lessonOne`
}
