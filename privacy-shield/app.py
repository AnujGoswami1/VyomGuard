"""VYOMSENTINEL Privacy Shield Demonstration App.

Simulated Secure Multi-Party Computation (SMPC) protocol demonstrating
collaborative space traffic management without revealing proprietary or classified orbital ephemerides.
"""

import time
import streamlit as st

# Configure page layout and visual theme
st.set_page_config(
    page_title="VYOMSENTINEL - Privacy Shield SMPC Demo",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Custom CSS for dark space aesthetic
st.markdown(
    """
    <style>
    .stApp {
        background: radial-gradient(circle at 50% 50%, #0a0e27 0%, #030014 100%);
        color: #e5e7eb;
        font-family: 'Inter', sans-serif;
    }
    .panel-box {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 14px;
        padding: 20px;
        backdrop-filter: blur(20px);
        margin-bottom: 20px;
    }
    .classified-badge {
        background-color: rgba(255, 51, 102, 0.15);
        color: #ff3366;
        border: 1px solid rgba(255, 51, 102, 0.3);
        padding: 4px 8px;
        border-radius: 6px;
        font-family: monospace;
        font-size: 11px;
        font-weight: bold;
    }
    .classified-badge-cyan {
        background-color: rgba(0, 245, 255, 0.15);
        color: #00f5ff;
        border: 1px solid rgba(0, 245, 255, 0.3);
        padding: 4px 8px;
        border-radius: 6px;
        font-family: monospace;
        font-size: 11px;
        font-weight: bold;
    }
    .disclaimer-box {
        background: rgba(255, 183, 0, 0.08);
        border: 1px solid rgba(255, 183, 0, 0.35);
        border-radius: 12px;
        padding: 16px;
        color: #e5e7eb;
        font-size: 12px;
        font-family: monospace;
        line-height: 1.6;
        margin-top: 30px;
    }
    .guarantee-item {
        color: #00ff88;
        font-family: monospace;
        font-size: 13px;
        margin: 6px 0;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# Initialize session state flags
if "operator_a_ready" not in st.session_state:
    st.session_state.operator_a_ready = False
if "operator_b_ready" not in st.session_state:
    st.session_state.operator_b_ready = False
if "computation_done" not in st.session_state:
    st.session_state.computation_done = False

st.markdown(
    """
    <div style="padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 25px;">
        <h1 style="font-size: 26px; font-weight: 800; letter-spacing: 0.15em; color: #ffffff; text-transform: uppercase; margin: 0;">
            VYOMSENTINEL // PRIVACY SHIELD PROTOCOL
        </h1>
        <p style="color: #9ca3af; font-family: monospace; font-size: 13px; margin-top: 6px;">
            Zero-Knowledge Orbital Conjunction Screening Protocol (Simulated Secure Multi-Party Computation)
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)

col1, col2, col3 = st.columns(3)

# Column 1: Operator A (Defense Satellite)
with col1:
    st.markdown(
        """
        <div class="panel-box">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h3 style="font-size: 16px; font-weight: 700; color: #ffffff; margin: 0;">
                    Operator A — Defense Satellite
                </h3>
                <span class="classified-badge">NODE A</span>
            </div>
            <p style="font-size: 12px; color: #9ca3af; line-height: 1.5; margin-bottom: 16px;">
                This operator is willing to compute conjunction risk but cannot reveal any orbital data due to classification policies.
            </p>
            <div style="margin-bottom: 10px; display: flex; justify-content: space-between; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px;">
                <span style="font-family: monospace; font-size: 12px; color: #9ca3af;">Position:</span>
                <span class="classified-badge">LOCKED // CLASSIFIED</span>
            </div>
            <div style="margin-bottom: 10px; display: flex; justify-content: space-between; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px;">
                <span style="font-family: monospace; font-size: 12px; color: #9ca3af;">Orbital Parameters:</span>
                <span class="classified-badge">LOCKED // CLASSIFIED</span>
            </div>
            <div style="margin-bottom: 18px; display: flex; justify-content: space-between; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px;">
                <span style="font-family: monospace; font-size: 12px; color: #9ca3af;">Ephemeris Vectors:</span>
                <span class="classified-badge">LOCKED // CLASSIFIED</span>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    if not st.session_state.operator_a_ready:
        if st.button("Initiate Secure Computation (Operator A)", use_container_width=True):
            st.session_state.operator_a_ready = True
            st.rerun()
    else:
        st.success("Operator A secret shares submitted to protocol.")

# Column 2: Operator B (Commercial Satellite)
with col2:
    st.markdown(
        """
        <div class="panel-box">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h3 style="font-size: 16px; font-weight: 700; color: #ffffff; margin: 0;">
                    Operator B — Commercial Satellite
                </h3>
                <span class="classified-badge-cyan">NODE B</span>
            </div>
            <p style="font-size: 12px; color: #9ca3af; line-height: 1.5; margin-bottom: 16px;">
                Proprietary constellation trajectories are confidential commercial secrets protected against competitor intelligence.
            </p>
            <div style="margin-bottom: 10px; display: flex; justify-content: space-between; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px;">
                <span style="font-family: monospace; font-size: 12px; color: #9ca3af;">Position:</span>
                <span class="classified-badge-cyan">LOCKED // CLASSIFIED</span>
            </div>
            <div style="margin-bottom: 10px; display: flex; justify-content: space-between; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px;">
                <span style="font-family: monospace; font-size: 12px; color: #9ca3af;">Orbital Parameters:</span>
                <span class="classified-badge-cyan">LOCKED // CLASSIFIED</span>
            </div>
            <div style="margin-bottom: 18px; display: flex; justify-content: space-between; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px;">
                <span style="font-family: monospace; font-size: 12px; color: #9ca3af;">Ephemeris Vectors:</span>
                <span class="classified-badge-cyan">LOCKED // CLASSIFIED</span>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    if not st.session_state.operator_b_ready:
        if st.button("Initiate Secure Computation (Operator B)", use_container_width=True):
            st.session_state.operator_b_ready = True
            st.rerun()
    else:
        st.success("Operator B secret shares submitted to protocol.")

# Column 3: Result Panel
with col3:
    st.markdown(
        """
        <div class="panel-box">
            <h3 style="font-size: 16px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0;">
                Privacy Shield Computation Output
            </h3>
        </div>
        """,
        unsafe_allow_html=True,
    )

    if not st.session_state.operator_a_ready or not st.session_state.operator_b_ready:
        st.info("Awaiting both parties to initiate secure computation before circuit executes.")
    else:
        if not st.session_state.computation_done:
            with st.spinner("Computing via secure multi-party computation..."):
                time.sleep(3.0)
                st.session_state.computation_done = True
                st.rerun()
        else:
            st.markdown(
                """
                <div style="background: rgba(255, 51, 102, 0.12); border: 1px solid rgba(255, 51, 102, 0.4); border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 16px;">
                    <span style="color: #ff3366; font-family: monospace; font-size: 11px; font-weight: bold; letter-spacing: 0.1em; display: block; margin-bottom: 4px;">
                        CONJUNCTION DETECTED
                    </span>
                    <div style="font-size: 22px; font-family: monospace; font-weight: 800; color: #ffffff;">
                        Miss Distance: 2.34 km
                    </div>
                    <div style="font-size: 12px; font-family: monospace; color: #ff3366; margin-top: 4px;">
                        Probability of Collision (Pc): 3.2e-4
                    </div>
                </div>

                <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 14px; margin-bottom: 16px;">
                    <div class="guarantee-item">[VERIFIED] Raw positions: NOT EXCHANGED</div>
                    <div class="guarantee-item">[VERIFIED] Orbital parameters: NOT EXCHANGED</div>
                    <div class="guarantee-item">[VERIFIED] Only Pc and miss distance revealed</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

            if st.button("Reset SMPC Protocol", use_container_width=True):
                st.session_state.operator_a_ready = False
                st.session_state.operator_b_ready = False
                st.session_state.computation_done = False
                st.rerun()

# Prominent Disclaimer Footer
st.markdown(
    """
    <div class="disclaimer-box">
        <strong>DISCLAIMER:</strong> This is a simulated secure multi-party computation workflow for demonstration.
        Production deployment would use cryptographic SMPC libraries (MPyC, PySyft) with formal security proofs.
        The information-flow guarantees illustrated here are the workflow we are building toward, not cryptographic
        guarantees of this simulation.
    </div>
    """,
    unsafe_allow_html=True,
)
