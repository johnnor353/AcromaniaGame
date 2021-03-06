import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { withTracker } from "meteor/react-meteor-data";
import classnames from "classnames";

const greycolor = {color: '#666666', fontFamily: 'Dungeon'};
const greyinput= {backgroundColor: 'transparent', border:'#333333 1px solid', color: '#ffcc30'};

export class SocialButtons extends PureComponent {
  static propTypes = {
    signIn: PropTypes.bool.isRequired
  };

  login = type => {
    const loginStyle = navigator.userAgent.match("CriOS")
      ? "redirect"
      : "popup";
    let loginFunc;
    if (type === "facebook") {
      loginFunc = Meteor.loginWithFacebook;
    } else if (type === "google") {
      loginFunc = Meteor.loginWithGoogle;
    } else {
      loginFunc = Meteor.loginWithTwitter;
    }

    loginFunc({ loginStyle, redirectUrl: Meteor.absoluteUrl("/") }, err => {
      if (err) {
        console.error(err);
        alert(`Error signing in: ${err.message}`);
      } else {
        FlowRouter.go("/");
      }
    });
  };

  render() {
    const signInText = this.props.signIn ? "Sign in with" : "Register with";

    return (
      <div className="oauth">
        <button
          className="ui fluid labeled icon facebook large button"
          onClick={() => this.login("facebook")}>
          <i className="facebook icon" />
          {signInText} Facebook
        </button>
        <button
          className="ui fluid labeled icon google plus large button"
          onClick={() => this.login("google")}>
          <i className="google plus icon" />
          {signInText} Google
        </button>
        <button
          className="ui fluid labeled icon twitter large button"
          onClick={() => this.login("twitter")}>
          <i className="twitter icon" />
          {signInText} Twitter
        </button>
      </div>
    );
  }
}

export class ValidateEmail extends PureComponent {
  static propTypes = {
    token: PropTypes.string.isRequired
  };

  state = {
    loading: true,
    error: null
  };

  UNSAFE_componentWillMount() {
    Accounts.verifyEmail(this.props.token, err => {
      if (err) {
        this.setState({ loading: false, error: err.reason });
      } else {
        this.setState({ loading: false });
      }
    });
  }

  render() {
    if (this.state.loading) {
      return <div className="ui active centered inline loader" />;
    }

    return (
      <div className="ui middle aligned centered grid" id="sign_in_register">
        <div className="column">
          {this.state.error ? (
            <div className="ui active error message">{this.state.error}</div>
          ) : (
            <div className="ui success message">
              Successfully validated your email address.{" "}
              <a href="/play">Start playing</a>!
            </div>
          )}
        </div>
      </div>
    );
  }
}

export class ChangePassword extends PureComponent {
  state = {
    loading: false,
    success: false
  };

  componentDidMount() {
    const form = $(this.form);
    form.form({
      fields: {
        oldpassword: "minLength[6]",
        password: "minLength[6]",
        password_confirm: "match[password]"
      },
      onSuccess: (evt, fields) => {
        evt.preventDefault();
        this.setState({ loading: true });
        Accounts.changePassword(fields.oldpassword, fields.password, err => {
          if (err) {
            form.form("add errors", [err.reason]);
            this.setState({ loading: false });
          } else {
            this.setState({ loading: false, success: true });
          }
        });
      }
    });
  }

  render() {
    if (this.state.success) {
      return (
        <div className="ui middle aligned centered grid" id="sign_in_register">
          <div className="column">
            <div className="ui success message">
              Successfully changed your password.
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="ui middle aligned centered grid" id="sign_in_register">
        <div className="column">
          <h2 className="ui center aligned header" style={greycolor}>Change password</h2>
          <form className="ui large form" ref={ref => (this.form = ref)}>
            <div className="ui stacked segment" style={{backgroundColor: 'transparent', border:'#333333 4px solid', color: '#ffcc30'}}>
              <div className="required field">
                <label style={greycolor}>Old password</label>
                <div className="ui fluid input icon">
                  <input
                    type="password"
                    name="oldpassword"
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="off"
                    required
                    style={greyinput} />
                </div>
              </div>
              <div className="required field">
                <label style={greycolor}>New password</label>
                <div className="ui fluid input icon">
                  <input
                    type="password"
                    name="password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="off"
                    required
                    style={greyinput} />
                </div>
              </div>
              <div className="required field">
                <label style={greycolor}>Confirm new password</label>
                <div className="ui fluid input icon">
                  <input
                    type="password"
                    name="password_confirm"
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="off"
                    required
                    style={greyinput} />
                </div>
              </div>
              <div className="ui error message" />
              <button
                type="submit"
                className={classnames("ui fluid large primary button accountBut", {
                  loading: this.state.loading
                })}>
                Change password
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export class ResetPassword extends PureComponent {
  static propTypes = {
    token: PropTypes.string.isRequired
  };

  state = {
    loading: false,
    success: false
  };

  componentDidMount() {
    const form = $(this.form);
    form.form({
      fields: {
        password: "minLength[6]",
        password_confirm: "match[password]"
      },
      onSuccess: (evt, fields) => {
        evt.preventDefault();
        this.setState({ loading: true });
        Accounts.resetPassword(this.props.token, fields.password, err => {
          if (err) {
            form.form("add errors", [err.reason]);
            this.setState({ loading: false });
          } else {
            this.setState({ loading: false, success: true });
          }
        });
      }
    });
  }

  render() {
    if (this.state.success) {
      return (
        <div className="ui middle aligned centered grid" id="sign_in_register">
          <div className="column">
            <div className="ui success message" style={greycolor}>
              Successfully reset your password.{" "}
              <a href="/play">Start playing</a>!
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="ui middle aligned centered grid" id="sign_in_register">
        <div className="column">
          <h2 className="ui center aligned header" style={greycolor}>Reset password</h2>
          <form className="ui large form" ref={ref => (this.form = ref)}>
            <div className="ui stacked segment" style={greyinput}>
              <div className="required field">
                <label style={greycolor}>Password</label>
                <div className="ui fluid input icon">
                  <input
                    type="password"
                    name="password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="off"
                    required
                    style={greyinput} />
                </div>
              </div>
              <div className="required field">
                <label style={greycolor}>Confirm password</label>
                <div className="ui fluid input icon">
                  <input
                    type="password"
                    name="password_confirm"
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="off"
                    required
                    style={greyinput} />
                </div>
              </div>
              <div className="ui error message" />
              <button
                type="submit"
                className={classnames("ui fluid large primary button accountBut", {
                  loading: this.state.loading
                })}>
                Reset password
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export class ForgotPassword extends PureComponent {
  state = {
    loading: false,
    success: false
  };

  componentDidMount() {
    const form = $(this.form);
    form.form({
      fields: {
        email: "email"
      },
      onSuccess: (evt, fields) => {
        evt.preventDefault();
        this.setState({ loading: true });
        Accounts.forgotPassword({ email: fields.email }, err => {
          if (err) {
            this.setState({ loading: false });
            form.form("add errors", [err.reason]);
          } else {
            this.setState({ success: true });
          }
        });
      }
    });
  }

  render() {    
    if (this.state.success) {
      return (
        <div className="ui middle aligned centered grid" id="sign_in_register">
          <div className="column">
            <div className="ui success message" style={greycolor}>
              Please check your email for further instructions.
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="ui middle aligned centered grid" id="sign_in_register">
        <div className="column">
          <h2 className="ui center aligned header" style={greycolor}>Reset password</h2>
          <form className="ui large form" ref={ref => (this.form = ref)}>
            <div className="ui stacked segment" style={greyinput}>
              <div className="required field">
                <label style={greycolor}>Email</label>
                <div className="ui fluid input icon">
                  <input
                    type="text"
                    name="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="off"
                    required
                    style={greyinput} />
                </div>
              </div>
              <div className="ui error message" />
              <button
                type="submit"
                className={classnames("ui fluid large primary button accountBut", {
                  loading: this.state.loading
                })}>
                Reset password
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export class Signup extends PureComponent {
  static propTypes = {
    loggingIn: PropTypes.bool.isRequired
  };

  state = {
    success: false
  };

  componentDidMount() {
    $(this.dropdown).dropdown();
    const form = $(this.form);
    form.form({
      fields: {
        username: "minLength[6]",
        email: "email",
        password: "minLength[6]",
        password_confirm: "match[password]"
      },
      onSuccess: (evt, fields) => {
        evt.preventDefault();
        Accounts.createUser(
          {
            username: fields.username,
            email: fields.email,
            password: fields.password,
            profile: {
              country: fields.country
            }
          },
          err => {
            if (err) {
              if (err.error === "email-not-verified") {
                // Successful login, but need them to verify
                this.setState({ success: true });
              } else {
                form.form("add errors", [err.reason]);
              }
            } else {
              FlowRouter.go("/");
            }
          }
        );
      }
    });
  }

  render() {
    if (this.state.success) {
      return (
        <div className="ui middle aligned centered grid" id="sign_in_register">
          <div className="column">
            <div className="ui success message">
              Successfully signed up. You must verify your email address to log
              in. Please check your email for instructions.
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="ui middle aligned centered grid" id="sign_in_register">
        <div className="column">
          <h2 className="ui center aligned header" style={greycolor}>Sign up</h2>
          {/*<SocialButtons signIn={false} />
          <div className="ui horizontal divider">OR</div>*/}
          <div className="pwd-form">
            <form className="ui large form" ref={ref => (this.form = ref)}>
              <div className="ui stacked segment" style={greyinput}>
                <div className="required field">
                  <label style={greycolor}>Username</label>
                  <div className="ui fluid input icon">
                    <input
                      type="text"
                      name="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      autoComplete="off"
                      required
                      style={greyinput} />
                  </div>
                </div>
                <div className="required field">
                  <label style={greycolor}>Email</label>
                  <div className="ui fluid input icon">
                    <input
                      type="email"
                      name="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      autoComplete="off"
                      required
                      style={greyinput} />
                  </div>
                </div>
                <div className="required field">
                  <label style={greycolor}>Password</label>
                  <div className="ui fluid input icon">
                    <input
                      type="password"
                      name="password"
                      autoCapitalize="none"
                      autoCorrect="off"
                      autoComplete="off"
                      required
                      style={greyinput} />
                  </div>
                </div>
                <div className="required field">
                  <label style={greycolor}>Confirm password</label>
                  <div className="ui fluid input icon">
                    <input
                      type="password"
                      name="password_confirm"
                      autoCapitalize="none"
                      autoCorrect="off"
                      autoComplete="off"
                      required
                      style={greyinput} />
                  </div>
                </div>
                <div className="ui error message" />
                <div style={{ marginBottom: "10px" }}>
                  <p>
                    <a href="/forgot-password">Forgot your password?</a>
                  </p>
                </div>
                <button
                  type="submit"
                  className={classnames("ui fluid large primary button accountBut", {
                    loading: this.props.loggingIn
                  })}>
                  Register
                </button>
              </div>
            </form>
          </div>
          <div className="ui large message" style={{backgroundColor: 'transparent', color: '#e3e3e3', border: '#707070 1px solid'}}>
            <p>
              If you already have an account? <a href="/sign-in">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export const SignupContainer = withTracker(() => {
  return {
    loggingIn: Meteor.loggingIn()
  };
})(Signup);

export class Login extends PureComponent {
  static propTypes = {
    loggingIn: PropTypes.bool.isRequired
  };

  componentDidMount() {
    const form = $(this.form);
    form.form({
      fields: {
        username: "empty",
        password: ["minLength[6]", "empty"]
      },
      onSuccess: (evt, fields) => {
        evt.preventDefault();
        Meteor.loginWithPassword(fields.username, fields.password, err => {
          if (err) {
            if (err.error === "email-not-verified") {
              form.form("add errors", [err.reason]);
            } else {
              form.form("add errors", [
                "Login failed. Please check your username/email and password."
              ]);
            }
          } else {
            FlowRouter.go("/");
          }
        });
      }
    });
  }

  render() {    
    return (
      <div className="ui middle aligned centered grid" id="sign_in_register">
        <div className="column">
          <h2 className="ui center aligned header" style={greycolor}>Sign in</h2>
          {/*<SocialButtons signIn={true} />
          <div className="ui horizontal divider">OR</div>*/}
          <div className="pwd-form">
            <form className="ui large form" ref={ref => (this.form = ref)}>
              <div className="ui stacked segment" style={{backgroundColor: 'transparent', border: '#333333 4px solid'}}>
                <div className="required field">
                  <label style={greycolor}>Username or email</label>
                  <div className="ui fluid input icon">
                    <input
                      type="text"
                      name="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      autoComplete="off"
                      required
                      style={{backgroundColor: 'transparent', border:'#333333 1px solid', color: '#ffcc30'}} />
                  </div>
                </div>
                <div className="required field">
                  <label style={greycolor}>Password</label>
                  <div className="ui fluid input icon">
                    <input
                      type="password"
                      name="password"
                      autoCapitalize="none"
                      autoCorrect="off"
                      autoComplete="off"
                      required
                      style={{backgroundColor: 'transparent', border:'#333333 1px solid', color: '#ffcc30'}} />
                  </div>
                </div>
                <div className="ui error message" />
                <div>
                  <p style={{ marginBottom: "10px" }}>
                    <a href="/forgot-password">Forgot your password?</a>
                  </p>
                </div>
                <button
                  type="submit"
                  className={classnames("ui fluid large primary button accountBut", {
                    loading: this.props.loggingIn
                  })}
                  >
                  Sign in
                </button>
              </div>
            </form>
          </div>
          <div className="ui large message" style={{backgroundColor: 'transparent', color: '#e3e3e3', border: '#707070 1px solid'}}>
            <p>
              Don't have an account? <a href="/sign-up">Register</a>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export const LoginContainer = withTracker(() => {
  return {
    loggingIn: Meteor.loggingIn()
  };
})(Login);
