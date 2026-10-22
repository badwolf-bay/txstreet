import Phaser from "phaser";
import { config, userSettings } from "../config.js";
import { toRes, calcStatValue, getSheetKey } from "../utils/";

export default class Sign extends Phaser.GameObjects.Container {
	constructor(scene) {
		super(scene);
		this.scene = scene;
		scene.add.existing(this);

		this.setDepth(this.scene.personDepth - 1);
		this.y = this.scene.busStop - toRes(105);
		this.signWidth = toRes(430);
		this.createSign();
	}

	recreate() {
		if(this.leftPole) this.leftPole.destroy();
		if(this.rightPole) this.rightPole.destroy();
		if(this.poles) this.poles.destroy();
		this.signBg.destroy();
		if (this.signOutline) this.signOutline.destroy();
		// this.coinNameText.destroy();
		this.middleText.destroy();
		this.bottomText.destroy();
		this.createSign();
	}

	createSign() {
		this.x =
			(this.scene.side == "right" ? this.signWidth / 2 + toRes(4) : -this.signWidth / 2 - toRes(4)) +
			this.scene.curbX;

		let leftPoleX = -(this.signWidth / 2);
		let RightPoleX = this.signWidth / 2;


		if (this.scene.isMall) {
			this.poles = this.scene.add.graphics({ fillStyle: { color: 0xBEBEC0 } });
			this.poles.fillRect(leftPoleX + toRes(50), toRes(-100), toRes(20), toRes(100));
			this.poles.fillRect(RightPoleX - toRes(70), toRes(-100), toRes(20), toRes(100));
			this.poles.fillRect(RightPoleX, toRes(-20), toRes(50), toRes(10));
			this.poles.fillRect(leftPoleX - toRes(50), toRes(-20), toRes(50), toRes(10));

			this.add(this.poles);

			this.blockchainSign = this.scene.add.image(this.scene.side === "right" ? leftPoleX - toRes(55) : RightPoleX + toRes(55), toRes(-15), getSheetKey("spotlight_sign.png"), "stoplight_sign.png");
			this.blockchainSign.clickObject = "stoplight";
			this.blockchainSign.setInteractive({ cursor: "help" });
			this.blockchainSign.setScale(config.resolution);
			this.add(this.blockchainSign);

			this.rollupSign = this.scene.add.image(this.scene.side === "right" ? RightPoleX + toRes(55) : leftPoleX - toRes(55), toRes(-15), getSheetKey("rollup_sign" + (this.scene.side == "right"?"_right":"") + ".png"), "rollup_sign" + (this.scene.side == "right"?"_right":"") + ".png");
			this.rollupSign.clickObject = "rollup";
			this.rollupSign.setInteractive({ cursor: "help" });
			this.rollupSign.setScale(config.resolution);
			this.add(this.rollupSign);
		}
		else {
			this.leftPole = this.scene.add.image(leftPoleX, 0, getSheetKey("sign_pole.png"), "sign_pole.png");
			this.leftPole.setScale(config.resolution);
			this.rightPole = this.scene.add.image(RightPoleX, 0, getSheetKey("sign_pole.png"), "sign_pole.png");
			this.rightPole.setScale(config.resolution);
			this.rightPole.setFlipX(true);
			this.add(this.leftPole);
			this.add(this.rightPole);
		}

		let signTop = -(toRes(151) / 2);
		let signLeft = leftPoleX + toRes(7);
		let signHeight =
		toRes(151) - toRes(config.theme.signPolePadding) - toRes(30);

		this.signBg = this.scene.add.graphics({ fillStyle: { color: config.theme.signBgColor } });
		this.signBg.fillRect(signLeft, signTop, this.signWidth - toRes(14), signHeight);

		this.fontSize = Math.floor(this.signWidth / 11.5);
		let sixthSize = signHeight / 6;

		let signFontColor = Phaser.Display.Color.HexStringToColor(config.theme.signFontColor);
		this.middleText = this.scene.add.bitmapText(
			0,
			signTop + sixthSize * 2,
			"highway",
			"Loading...",
			this.fontSize
		);
		this.middleText.setOrigin(0.5, 0.5);
		this.middleText.setTint(signFontColor.color);

		this.bottomText = this.scene.add.bitmapText(0, signTop + sixthSize * 4, "highway", "", this.fontSize);
		this.bottomText.setOrigin(0.5, 0.5);
		this.bottomText.setTint(signFontColor.color);

		if (this.scene.isMall) {
			this.signOutline = this.scene.add.graphics({ fillStyle: { color: 0xBEBEC0 } });
			this.signOutline.fillRoundedRect(signLeft - toRes(8), signTop - toRes(8), this.signWidth + toRes(2), signHeight + toRes(16), toRes(6));
			this.add(this.signOutline);
		}
		this.add(this.signBg);
		this.add(this.middleText);
		this.add(this.bottomText);

		this.signEdit = this.scene.add.image(
			signLeft + this.signWidth - toRes(28),
			signTop + toRes(12),
			getSheetKey("edit.png"),
			"edit.png"
		);
		this.signEdit.setScale(toRes(0.5));
		this.signEdit.setAlpha(0.5);
		this.signEdit.setOrigin(0.5, 0.5);
		this.signEdit.setInteractive({ useHandCursor: true });
		this.signEdit.on("pointerup", e => {
			if (e.downElement.nodeName.toLowerCase() !== "canvas") return;
			this.scene.vue.editSign();
		});
		this.add(this.signEdit);
	}

	alternateStats(shorts = userSettings[this.scene.ticker + "Settings"].signArray.value) {
		this.currentShort = 0;
		this.alternatingShorts = shorts;
		if (this.alternatingTimer) {
			this.alternatingTimer.destroy();
		}
		this.alternatingTimer = this.scene.time.addEvent({
			delay: 5000,
			startAt: 4000,
			callback: function () {
				this.setSignToStat(this.alternatingShorts[this.currentShort], true);
				this.currentShort++;
				if (this.currentShort >= this.alternatingShorts.length) this.currentShort = 0;
			},
			callbackScope: this,
			loop: true,
		});
	}

	fitTextToSign(textObject) {
		if (parseFloat(textObject.fontSize) !== this.fontSize) textObject.setFontSize(this.fontSize);
		let widthFit = textObject.width / (this.signWidth - toRes(20));
		if (widthFit > 1) {
			textObject.setFontSize(this.fontSize / widthFit);
		}
	}

	setSignToStat(short, reset) {
		if (typeof this.scene.vue === "undefined" || typeof this.scene.vue.stats[short] === "undefined") return false;
		let stat = this.scene.vue.stats[short];
		if (typeof stat.title === "undefined" || typeof stat.value === "undefined") return false;
		let title = stat.signTitle ? stat.signTitle : stat.title;

		if (this.middleText.text != title) {
			this.middleText.setText(title);
			this.fitTextToSign(this.middleText);
		}
		let displayedValue = calcStatValue(stat);
		if (this.bottomText.text != displayedValue) {
			this.bottomText.setText(displayedValue);
			this.fitTextToSign(this.bottomText);
		}

		if (reset) {
			if (typeof this.signStatInterval !== "undefined") this.signStatInterval.destroy();
			this.signStatInterval = this.scene.time.addEvent({
				delay: 100,
				callback: function () {
					this.setSignToStat(short, false);
				},
				callbackScope: this,
				loop: true,
			});
		}
	}
}
