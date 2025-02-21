import ReactGA from "react-ga4";

export class PageTimeTracker {
    private startTime: number;
    private accumulatedTime: number;
    private isVisible: boolean;
    private path: string;

    constructor(path: string) {
        this.path = path;
        this.startTime = Date.now();
        this.accumulatedTime = 0;
        this.isVisible = !document.hidden;

        // ページの表示状態変更を監視
        document.addEventListener(
            "visibilitychange",
            this.handleVisibilityChange
        );
        // ページを閉じる前の処理
        window.addEventListener("beforeunload", this.handleBeforeUnload);
    }

    private handleVisibilityChange = () => {
        if (document.hidden) {
            // ページが非表示になった時
            this.updateAccumulatedTime();
            this.isVisible = false;
        } else {
            // ページが再表示された時
            this.startTime = Date.now();
            this.isVisible = true;
        }
    };

    private handleBeforeUnload = () => {
        this.sendTimeToGA4();
    };

    private updateAccumulatedTime() {
        if (this.isVisible) {
            this.accumulatedTime += Date.now() - this.startTime;
        }
    }

    private sendTimeToGA4() {
        this.updateAccumulatedTime();
        const timeInSeconds = Math.round(this.accumulatedTime / 1000);

        if (timeInSeconds > 0) {
            ReactGA.event({
                category: "User Engagement",
                action: "Time Spent on Page",
                label: this.path,
                value: timeInSeconds,
            });
        }
    }

    public cleanup() {
        this.sendTimeToGA4();
        document.removeEventListener(
            "visibilitychange",
            this.handleVisibilityChange
        );
        window.removeEventListener("beforeunload", this.handleBeforeUnload);
    }
}

export const trackPageTransition = (from: string, to: string) => {
    ReactGA.event({
        category: "Navigation",
        action: "Page Transition",
        label: `${from} -> ${to}`,
    });
};
